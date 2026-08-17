import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { jsonBody, oneOf, str, url } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireBusinessAdmin();
    const body = await jsonBody(request);
    const name = str(body.name, "name", 2);
    const systemInstructions = str(body.systemInstructions, "systemInstructions", 10);
    const language = str(body.language === undefined ? "English" : body.language, "language", 2);
    const tone = str(body.tone === undefined ? "Helpful" : body.tone, "tone", 2);
    const status = oneOf(body.status, ["ACTIVE", "INACTIVE"], "status", "ACTIVE") as "ACTIVE" | "INACTIVE";
    const calendlyUrl = url(body.calendlyUrl, "calendlyUrl", true) || null;
    const business = await prisma.business.update({
      where: { id: user.businessId! },
      data: {
        agentName: name,
        agentInstructions: systemInstructions,
        agentLanguage: language,
        agentTone: tone,
        agentStatus: status,
        calendlyUrl
      }
    });

    return NextResponse.json({ business });
  } catch (error) {
    return handleRouteError(error);
  }
}