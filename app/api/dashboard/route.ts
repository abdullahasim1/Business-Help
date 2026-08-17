import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireBusinessAdmin();
  const businessId = user.businessId!;
  const [contacts, conversations, calls, business] = await Promise.all([
    prisma.contact.count({ where: { businessId } }),
    prisma.conversation.count({ where: { businessId } }),
    prisma.call.count({ where: { businessId } }),
    prisma.business.findUnique({
      where: { id: businessId },
      select: { agentName: true, agentStatus: true, knowledgeText: true, website: true }
    })
  ]);

  return NextResponse.json({ contacts, conversations, calls, business });
}
