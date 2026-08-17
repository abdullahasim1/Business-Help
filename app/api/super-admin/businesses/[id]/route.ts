import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { parseId } from "@/lib/ids";
import { prisma } from "@/lib/prisma";
import { jsonBody, oneOf, str, strOrNull } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin();
    const id = parseId((await params).id);
    if (!id) throw new Error("Invalid business ID");
    const body = await jsonBody(request);
    const data: {
      name?: string;
      website?: string | null;
      status?: "ACTIVE" | "INACTIVE";
      voiceAgentId?: string | null;
      chatAgentId?: string | null;
    } = {};
    if (body.name !== undefined) data.name = str(body.name, "name", 2);
    if (body.website !== undefined) data.website = strOrNull(body.website, "website");
    if (body.status !== undefined) data.status = oneOf(body.status, ["ACTIVE", "INACTIVE"], "status") as "ACTIVE" | "INACTIVE";
    if (body.voiceAgentId !== undefined) data.voiceAgentId = strOrNull(body.voiceAgentId, "voiceAgentId");
    if (body.chatAgentId !== undefined) data.chatAgentId = strOrNull(body.chatAgentId, "chatAgentId");
    const business = await prisma.business.update({
      where: { id },
      data
    });

    return NextResponse.json({ business });
  } catch (error) {
    return handleRouteError(error);
  }
}