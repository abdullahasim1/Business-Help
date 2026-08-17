import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireBusinessAdmin();
  const business = await prisma.business.findUnique({
    where: { id: user.businessId! },
    select: { agentName: true, agentInstructions: true, agentLanguage: true, agentTone: true, agentStatus: true, calendlyUrl: true }
  });

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  return NextResponse.json({
    name: business.agentName,
    systemInstructions: business.agentInstructions,
    language: business.agentLanguage,
    tone: business.agentTone,
    status: business.agentStatus,
    calendlyUrl: business.calendlyUrl
  });
}
