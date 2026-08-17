import { z } from "zod";
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

const chatSchema = z.object({
  businessId: z.coerce.number().int().positive(),
  conversationId: z.coerce.number().int().positive().optional().nullable(),
  contactId: z.coerce.number().int().positive().optional().nullable(),
  visitorToken: z.string().min(20).optional().nullable(),
  widgetKey: z.string().min(20),
  message: z.string().min(1).max(4000)
});

export function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  const origin = corsOrigin(request);
  try {
    const body = chatSchema.parse(await request.json());
    const business = await prisma.business.findFirst({
      where: { id: body.businessId, status: "ACTIVE" }
    });

    if (!business || business.agentStatus !== "ACTIVE" || !business.chatEnabled) {
      return corsJson({ error: "Chat is not available for this business" }, { status: 404 }, origin);
    }

    if (!isAllowedWidgetRequest(request, business, body.widgetKey)) {
      return corsJson({ error: "This widget is not allowed on this website." }, { status: 403 }, origin);
    }

    if (!allowRequest(`chat:${business.id}:${requestIp(request)}`, 20, 60_000)) {
      return corsJson({ error: "Too many chat messages. Please try again shortly." }, { status: 429 }, origin);
    }

    const existingContact = body.contactId ? await findBusinessContact(body.contactId, business.id, body.visitorToken) : null;
    if (body.contactId && !existingContact) {
      return corsJson({ error: "Invalid contact for business" }, { status: 403 }, origin);
    }

    const newContact = existingContact ? null : await createWidgetContact(business.id, extractLeadFields(body.message));
    const contactId = existingContact?.id || newContact?.id;
    const visitorToken = existingContact?.visitorToken || newContact?.visitorToken || body.visitorToken || null;

    const conversation = body.conversationId
      ? await prisma.conversation.findFirst({
          where: { id: body.conversationId, businessId: business.id, visitorToken: body.visitorToken || "" }
        })
      : await prisma.conversation.create({
          data: {
          businessId: business.id,
          contactId,
          channel: "WIDGET",
          visitorToken,
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
      const result = await generateRetellResponse({ ...chatContext, chatAgentId }, providerChatId, body.message);
      providerChatId = result.providerChatId;
      answer = result.answer;
    } else {
      answer = generateLocalKnowledgeResponse(business.agentName, knowledge, body.message, business.calendlyUrl);
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        contactId: conversation.contactId || contactId,
        providerChatId,
        messagesJson: addMessage(addMessage(conversation.messagesJson, "user", body.message), "assistant", answer)
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
