import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireBusinessAdmin();
    const businessId = user.businessId!;
    const [contacts, conversations, calls, business, recentContacts, recentConversations] = await Promise.all([
      prisma.contact.count({ where: { businessId } }),
      prisma.conversation.count({ where: { businessId } }),
      prisma.call.count({ where: { businessId } }),
      prisma.business.findUnique({
        where: { id: businessId },
        select: { agentName: true, agentStatus: true, knowledgeText: true, website: true }
      }),
      prisma.contact.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, phone: true, interestedService: true, status: true, source: true, createdAt: true }
      }),
      prisma.conversation.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, channel: true, contact: { select: { name: true, email: true } }, messagesJson: true, createdAt: true }
      })
    ]);

    return NextResponse.json({ contacts, conversations, calls, business, recentContacts, recentConversations });
  } catch (error) {
    return handleRouteError(error);
  }
}
