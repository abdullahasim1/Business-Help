import { corsJson, corsOptions, publicCorsHeaders } from "@/lib/cors";
import { createWidgetContact, findBusinessContact } from "@/lib/contacts";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { corsOrigin, isAllowedWidgetRequest } from "@/lib/public-widget";
import { allowRequest, requestIp } from "@/lib/rate-limit";
import { startVoiceCall } from "@/lib/voice";
import { retrieveKnowledge } from "@/lib/knowledge";
import { email, jsonBody, positiveInt, str, strOptional, strOrNull } from "@/lib/validation";

const contactSummary = async (contactId: number | null | undefined): Promise<string> => {
  if (!contactId) return "";
  const contact = await prisma.contact.findUnique({ where: { id: contactId } });
  if (!contact) return "";
  return `Name: ${contact.name || "-"}, Phone: ${contact.phone || "-"}, Email: ${contact.email || "-"}`;
};

export const OPTIONS = (request: Request) => corsOptions(request);

export const POST = async (request: Request) => {
  const origin = corsOrigin(request);
  try {
    const body = await jsonBody(request);
    const businessId = positiveInt(body.businessId, "businessId");
    const contactId = body.contactId === undefined || body.contactId === null ? null : positiveInt(body.contactId, "contactId");
    const visitorToken = strOrNull(body.visitorToken, "visitorToken");
    const widgetKey = str(body.widgetKey, "widgetKey", 20);
    const name = strOptional(body.name, "name");
    const contactEmail = body.email === undefined || body.email === null ? null : email(body.email);
    const phone = strOptional(body.phone, "phone");
    const interestedService = strOptional(body.interestedService, "interestedService");
    const business = await prisma.business.findFirst({
      where: { id: businessId, status: "ACTIVE" }
    });

    if (!business || !business.callEnabled) {
      return corsJson({ error: "Calls are not available for this business" }, { status: 404 }, origin);
    }

    if (!isAllowedWidgetRequest(request, business, widgetKey)) {
      return corsJson({ error: "This widget is not allowed on this website." }, { status: 403 }, origin);
    }

    if (!allowRequest(`call:${business.id}:${requestIp(request)}`, 3, 60 * 60_000)) {
      return corsJson({ error: "Call limit reached. Please try again later." }, { status: 429 }, origin);
    }

    const existingContact = contactId ? await findBusinessContact(contactId, business.id, visitorToken) : null;
    if (contactId && !existingContact) {
      return corsJson({ error: "Invalid contact for business" }, { status: 403 }, origin);
    }

    const newContact = existingContact
      ? null
      : await createWidgetContact(business.id, {
          name: name || null,
          email: contactEmail,
          phone: phone || null,
          interestedService: interestedService || null
        });
    const resolvedContactId = existingContact?.id || newContact?.id;

    const callSession = await startVoiceCall({
      businessId: business.id,
      contactId: resolvedContactId,
      voiceAgentId: business.voiceAgentId,
      agentName: business.name,
      context: {
        agentName: business.agentName,
        language: business.agentLanguage,
        tone: business.agentTone,
        knowledge: await retrieveKnowledge(business.id),
        bookingUrl: business.calendlyUrl,
        instructions: business.agentInstructions,
        contactSummary: await contactSummary(resolvedContactId)
      }
    });
    const call = await prisma.call.create({
      data: {
        businessId: business.id,
        contactId: resolvedContactId,
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
};
