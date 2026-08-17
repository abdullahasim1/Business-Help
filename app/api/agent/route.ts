import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const agentSchema = z.object({
  name: z.string().min(2),
  systemInstructions: z.string().min(10),
  language: z.string().min(2).default("English"),
  tone: z.string().min(2).default("Helpful"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  calendlyUrl: z.string().url().optional().or(z.literal(""))
});

export async function POST(request: Request) {
  try {
    const user = await requireBusinessAdmin();
    const body = agentSchema.parse(await request.json());
    const business = await prisma.business.update({
      where: { id: user.businessId! },
      data: {
        agentName: body.name,
        agentInstructions: body.systemInstructions,
        agentLanguage: body.language,
        agentTone: body.tone,
        agentStatus: body.status,
        calendlyUrl: body.calendlyUrl || null
      }
    });

    return NextResponse.json({ business });
  } catch (error) {
    return handleRouteError(error);
  }
}
