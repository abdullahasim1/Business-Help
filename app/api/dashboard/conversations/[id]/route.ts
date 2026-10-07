import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/http";
import { parseId } from "@/lib/ids";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireBusinessAdmin();
    const id = parseId((await params).id);
    if (!id) return jsonError("Conversation not found", 404);
    const conversation = await prisma.conversation.findFirst({
      where: { id, businessId: user.businessId! },
      select: {
        id: true,
        createdAt: true,
        messagesJson: true,
        contact: { select: { name: true, email: true, phone: true } }
      }
    });

    if (!conversation) return jsonError("Conversation not found", 404);
    return NextResponse.json(conversation);
  } catch (error) {
    return handleRouteError(error);
  }
}
