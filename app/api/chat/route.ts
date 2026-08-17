import { corsJson, corsOptions, publicCorsHeaders } from "@/lib/cors";
import { createWidgetContact, findBusinessContact } from "@/lib/contacts";
import { addMessage } from "@/lib/conversations";
import { generateLocalKnowledgeResponse, generateRetellResponse } from "@/lib/llm";
import { extractLeadFields } from "@/lib/lead-capture";
import { ensureChatAgent } from "@/lib/retell-setup";
import { retrieveKnowledge } from "@/lib/knowledge";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { corsOrigin, isAllowedWidgetRequest } from "@/lib/public-widget";
import { allowRequest, requestIp } from "@/lib/rate-limit";
import { jsonBody, maxLength, positiveInt, str, strOrNull } from "@/lib/validation";

export function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  const origin = corsOrigin(request);
  try {
    const body = await jsonBody(request);
    const businessId = positiveInt(body.businessId, "businessId");
    const conversationId = body.conversationId === undefined || body.conversationId === null ? null : positiveInt(body.conversationId, "conversationId");
    const contactIdIn = body.contactId === undefined || body.contactId === null ? null : positiveInt(body.contactId, "contactId");
    const visitorToken = strOrNull(body.visitorToken, "visitorToken");
    const widgetKey = str(body.widgetKey, "widgetKey", 20);
    const message = maxLength(str(body.message, "message", 1), 4000, "message") as string;
    const business = await prisma.business.findFirst({
      where: { id: businessId, status: "ACTIVE" }
    });

    if (!business || business.agentStatus !== "ACTIVE" || !business.chatEnabled) {
      return corsJson({ error: "Chat is not available for this business" }, { status: 404 }, origin);
    }

    if (!isAllowedWidgetRequest(request, business, widgetKey)) {
      return corsJson({ error: "This widget is not allowed on this website." }, { status: 403 }, origin);
    }

    if (!allowRequest(`chat:${business.id}:${requestIp(request)}`, 20, 60_000)) {
      return corsJson({ error: "Too many chat messages. Please try again shortly." }, { status: 429 }, origin);
    }

    const existingContact = contactIdIn ? await findBusinessContact(contactIdIn, business.id, visitorToken) : null;
    if (contactIdIn && !existingContact) {
      return corsJson({ error: "Invalid contact for business" }, { status: 403 }, origin);
    }

    const newContact = existingContact ? null : await createWidgetContact(business.id, extractLeadFields(message));
    const contactId = existingContact?.id || newContact?.id;
    const resolvedVisitorToken = existingContact?.visitorToken || newContact?.visitorToken || visitorToken || null;

    const conversation = conversationId
      ? await prisma.conversation.findFirst({
          where: { id: conversationId, businessId: business.id, visitorToken: visitorToken || "" }
        })
      : await prisma.conversation.create({
          data: {
          businessId: business.id,
          contactId,
          channel: "WIDGET",
          visitorToken: resolvedVisitorToken,
          messagesJson: "[]"
          }
        });

    if (!conversation) return corsJson({ error: "Conversation not found" }, { status: 404 }, origin);

    const knowledge = await retrieveKnowledge(business.id);
    const chatContext = {
      agentName: business.agentName,
      language: business.agentLanguage,
      tone: business.agentTone,
      knowledge,
      welcomeMessage: business.welcomeMessage,
      chatAgentId: business.chatAgentId,
      bookingUrl: business.calendlyUrl
    };

    let answer: string;
    let providerChatId = conversation.providerChatId;
    let chatAgentId = business.chatAgentId;
    if (!chatAgentId) {
      try {
        chatAgentId = await ensureChatAgent();
      } catch (error) {
        console.error("Default chat agent unavailable", error);
      }
    }
    if (chatAgentId) {
      const result = await generateRetellResponse({ ...chatContext, chatAgentId }, providerChatId, message);
      providerChatId = result.providerChatId;
      answer = result.answer;
    } else {
      answer = generateLocalKnowledgeResponse(business.agentName, knowledge, message, business.calendlyUrl);
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        contactId: conversation.contactId || contactId,
        providerChatId,
        messagesJson: addMessage(addMessage(conversation.messagesJson, "user", message), "assistant", answer)
      }
    });

    return corsJson({
      response: answer,
      conversationId: conversation.id,
      contactId,
      visitorToken
    }, undefined, origin);
  } catch (error) {
    return handleRouteError(error, publicCorsHeaders(origin));
  }
}
