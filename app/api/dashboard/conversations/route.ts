import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireBusinessAdmin();
    const conversations = await prisma.conversation.findMany({
      where: { businessId: user.businessId! },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        channel: true,
        createdAt: true,
        messagesJson: true,
        contact: { select: { name: true, email: true, phone: true } }
      }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    return handleRouteError(error);
  }
}
