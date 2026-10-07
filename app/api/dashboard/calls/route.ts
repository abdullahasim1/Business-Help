import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireBusinessAdmin();
    const calls = await prisma.call.findMany({
      where: { businessId: user.businessId! },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        providerCallId: true,
        duration: true,
        transcript: true,
        summary: true,
        recordingUrl: true,
        createdAt: true,
        contact: { select: { email: true, phone: true } }
      }
    });

    return NextResponse.json(calls);
  } catch (error) {
    return handleRouteError(error);
  }
}
