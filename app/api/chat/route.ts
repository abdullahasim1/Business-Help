import { corsJson, corsOptions, publicCorsHeaders } from "@/lib/cors";
import { randomBytes } from "node:crypto";
import { createWidgetContact, findBusinessContact, findContactByToken, updateWidgetContact } from "@/lib/contacts";
import { addMessage, readMessages } from "@/lib/conversations";
import { generateLocalKnowledgeResponse, generateRetellResponse } from "@/lib/llm";
import { extractLeadFields } from "@/lib/lead-capture";
import { ensureBusinessChatAgent } from "@/lib/retell-setup";
import { retrieveKnowledge } from "@/lib/knowledge";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { corsOrigin, isAllowedWidgetRequest } from "@/lib/public-widget";
import { allowRequest, requestIp } from "@/lib/rate-limit";
import { jsonBody, maxLength, positiveInt, str, strOrNull } from "@/lib/validation";

export const OPTIONS = (request: Request) => corsOptions(request);

export const POST = async (request: Request) => {
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

    let conversation = conversationId
      ? await prisma.conversation.findFirst({
          where: { id: conversationId, businessId: business.id, visitorToken: visitorToken || "" }
        })
      : null;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          businessId: business.id,
          contactId: existingContact?.id,
          channel: "WIDGET",
          visitorToken: existingContact?.visitorToken || visitorToken || randomBytes(24).toString("base64url"),
          messagesJson: "[]"
        }
      });
    }

    let activeContact = existingContact || (await findContactByToken(business.id, visitorToken));
    if (!activeContact && conversation.contactId) {
      activeContact = await findBusinessContact(conversation.contactId, business.id, conversation.visitorToken);
    }
    if (activeContact && !conversation.contactId) {
      await prisma.conversation.update({ where: { id: conversation.id }, data: { contactId: activeContact.id } });
    }

    const conversationText = readMessages(conversation.messagesJson)
      .filter((item) => item.role === "user")
      .map((item) => item.content)
      .join(" ");
    const extracted = extractLeadFields(`${conversationText} ${message}`);

    if (!activeContact && (extracted.email || extracted.phone || extracted.name)) {
      activeContact = await prisma.contact.findFirst({
        where: {
          businessId: business.id,
          OR: [
            ...(extracted.email ? [{ email: extracted.email }] : []),
            ...(extracted.phone ? [{ phone: extracted.phone }] : []),
            ...(!extracted.email && !extracted.phone && extracted.name ? [{ name: extracted.name }] : [])
          ]
        }
      });
      if (activeContact) {
        await prisma.conversation.update({ where: { id: conversation.id }, data: { contactId: activeContact.id } });
      }
    }

    if (activeContact) {
      await updateWidgetContact(activeContact.id, business.id, activeContact.visitorToken, extracted);
    } else {
      const created = await createWidgetContact(business.id, extracted, conversation.visitorToken || undefined);
      if (created) {
        activeContact = created;
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { contactId: created.id }
        });
      }
    }
    const contactId = activeContact?.id || null;

    if (!conversation) return corsJson({ error: "Conversation not found" }, { status: 404 }, origin);

    const contactSummary = activeContact
      ? `Name: ${extracted.name || activeContact.name || "-"}, Phone: ${extracted.phone || activeContact.phone || "-"}, Email: ${extracted.email || activeContact.email || "-"}`
      : "";
    const knowledge = await retrieveKnowledge(business.id);
    const chatContext = {
      agentName: business.agentName,
      language: business.agentLanguage,
      tone: business.agentTone,
      knowledge,
      chatAgentId: business.chatAgentId,
      bookingUrl: business.calendlyUrl,
      instructions: business.agentInstructions,
      contactSummary
    };

    let answer: string;
    let providerChatId = conversation.providerChatId;
    let chatAgentId = business.chatAgentId;
    if (!chatAgentId) {
      try {
        chatAgentId = await ensureBusinessChatAgent(business.id, business.name);
      } catch (error) {
        console.error("Business chat agent unavailable", error);
      }
    }
    if (chatAgentId) {
      const result = await generateRetellResponse({ ...chatContext, chatAgentId }, providerChatId, message);
      providerChatId = result.providerChatId;
      answer = result.answer;
    } else {
      answer = generateLocalKnowledgeResponse(business.agentName, knowledge, message);
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
      visitorToken: conversation.visitorToken
    }, undefined, origin);
  } catch (error) {
    return handleRouteError(error, publicCorsHeaders(origin));
  }
};
