import { z } from "zod";
import { corsJson, corsOptions, publicCorsHeaders } from "@/lib/cors";
import { createWidgetContact } from "@/lib/contacts";
import { handleRouteError } from "@/lib/http";
import { corsOrigin, isAllowedWidgetRequest } from "@/lib/public-widget";
import { prisma } from "@/lib/prisma";
import { allowRequest, requestIp } from "@/lib/rate-limit";

const captureSchema = z.object({
  businessId: z.coerce.number().int().positive(),
  name: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email(),
  widgetKey: z.string().min(20),
  interestedService: z.string().optional().nullable()
});

export function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  const origin = corsOrigin(request);
  try {
    const body = captureSchema.parse(await request.json());
    const business = await prisma.business.findFirst({
      where: { id: body.businessId, status: "ACTIVE" }
    });

    if (!business) {
      return corsJson({ error: "Business not found" }, { status: 404 }, origin);
    }

    if (!isAllowedWidgetRequest(request, business, body.widgetKey)) {
      return corsJson({ error: "This widget is not allowed on this website." }, { status: 403 }, origin);
    }

    if (!allowRequest(`lead:${business.id}:${requestIp(request)}`, 10, 15 * 60_000)) {
      return corsJson({ error: "Too many requests. Please try again later." }, { status: 429 }, origin);
    }

    const contact = await createWidgetContact(business.id, body);

    return corsJson({ contact: contact && { id: contact.id, visitorToken: contact.visitorToken } }, undefined, origin);
  } catch (error) {
    return handleRouteError(error, publicCorsHeaders(origin));
  }
}
