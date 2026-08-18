import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireBusinessAdmin();
  const business = await prisma.business.findUnique({
    where: { id: user.businessId! },
    select: {
      chatEnabled: true,
      callEnabled: true,
      allowedOrigins: true,
      publicKey: true,
      id: true
    }
  });

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  return NextResponse.json({
    chatEnabled: business.chatEnabled,
    callEnabled: business.callEnabled,
    allowedOrigins: business.allowedOrigins,
    publicKey: business.publicKey,
    businessId: business.id
  });
}
