import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireBusinessAdmin();
    const contacts = await prisma.contact.findMany({
      where: { businessId: user.businessId! },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        interestedService: true,
        status: true,
        source: true,
        createdAt: true,
        _count: { select: { conversations: true, calls: true } }
      }
    });

    return NextResponse.json(contacts);
  } catch (error) {
    return handleRouteError(error);
  }
}
