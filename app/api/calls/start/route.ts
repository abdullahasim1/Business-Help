import { z } from "zod";
import { corsJson, corsOptions, publicCorsHeaders } from "@/lib/cors";
import { createWidgetContact, findBusinessContact } from "@/lib/contacts";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { corsOrigin, isAllowedWidgetRequest } from "@/lib/public-widget";
import { allowRequest, requestIp } from "@/lib/rate-limit";
import { startVoiceCall } from "@/lib/voice";
import { retrieveKnowledge } from "@/lib/knowledge";

const startCallSchema = z.object({
  businessId: z.coerce.number().int().positive(),
  contactId: z.coerce.number().int().positive().optional().nullable(),
  visitorToken: z.string().min(20).optional().nullable(),
  widgetKey: z.string().min(20),
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  interestedService: z.string().optional().nullable()
});

export function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  const origin = corsOrigin(request);
  try {
    const body = startCallSchema.parse(await request.json());
    const business = await prisma.business.findFirst({
      where: { id: body.businessId, status: "ACTIVE" }
    });

    if (!business || !business.callEnabled) {
      return corsJson({ error: "Calls are not available for this business" }, { status: 404 }, origin);
    }

    if (!isAllowedWidgetRequest(request, business, body.widgetKey)) {
      return corsJson({ error: "This widget is not allowed on this website." }, { status: 403 }, origin);
    }

    if (!allowRequest(`call:${business.id}:${requestIp(request)}`, 3, 60 * 60_000)) {
      return corsJson({ error: "Call limit reached. Please try again later." }, { status: 429 }, origin);
    }

    const existingContact = body.contactId ? await findBusinessContact(body.contactId, business.id, body.visitorToken) : null;
    if (body.contactId && !existingContact) {
      return corsJson({ error: "Invalid contact for business" }, { status: 403 }, origin);
    }

    const newContact = existingContact
      ? null
      : await createWidgetContact(business.id, {
          name: body.name,
          email: body.email,
          phone: body.phone,
          interestedService: body.interestedService
        });
    const contactId = existingContact?.id || newContact?.id;

    const callSession = await startVoiceCall({
      businessId: business.id,
      contactId,
      voiceAgentId: business.voiceAgentId,
      context: {
        agentName: business.agentName,
        language: business.agentLanguage,
        tone: business.agentTone,
        knowledge: await retrieveKnowledge(business.id),
        welcomeMessage: business.welcomeMessage,
        bookingUrl: business.calendlyUrl
      }
    });
    const call = await prisma.call.create({
      data: {
        businessId: business.id,
        contactId,
        providerCallId: callSession.providerCallId,
        summary: callSession.summary
      }
    });

    return corsJson({
      call: { id: call.id, contactId: call.contactId },
      callSession
    }, undefined, origin);
  } catch (error) {
    return handleRouteError(error, publicCorsHeaders(origin));
  }
}
