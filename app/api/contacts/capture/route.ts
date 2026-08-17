import { corsJson, corsOptions, publicCorsHeaders } from "@/lib/cors";
import { createWidgetContact } from "@/lib/contacts";
import { handleRouteError } from "@/lib/http";
import { corsOrigin, isAllowedWidgetRequest } from "@/lib/public-widget";
import { prisma } from "@/lib/prisma";
import { allowRequest, requestIp } from "@/lib/rate-limit";
import { email, jsonBody, positiveInt, str, strOptional } from "@/lib/validation";

export function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  const origin = corsOrigin(request);
  try {
    const body = await jsonBody(request);
    const businessId = positiveInt(body.businessId, "businessId");
    const name = str(body.name, "name");
    const phone = str(body.phone, "phone", 5);
    const contactEmail = email(body.email);
    const widgetKey = str(body.widgetKey, "widgetKey", 20);
    const interestedService = strOptional(body.interestedService, "interestedService");

    const business = await prisma.business.findFirst({
      where: { id: businessId, status: "ACTIVE" }
    });

    if (!business) {
      return corsJson({ error: "Business not found" }, { status: 404 }, origin);
    }

    if (!isAllowedWidgetRequest(request, business, widgetKey)) {
      return corsJson({ error: "This widget is not allowed on this website." }, { status: 403 }, origin);
    }

    if (!allowRequest(`lead:${business.id}:${requestIp(request)}`, 10, 15 * 60_000)) {
      return corsJson({ error: "Too many requests. Please try again later." }, { status: 429 }, origin);
    }

    const contact = await createWidgetContact(business.id, {
      name,
      phone,
      email: contactEmail,
      interestedService: interestedService || null
    });

    return corsJson({ contact: contact && { id: contact.id, visitorToken: contact.visitorToken } }, undefined, origin);
  } catch (error) {
    return handleRouteError(error, publicCorsHeaders(origin));
  }
}