import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { parseId } from "@/lib/ids";
import { prisma } from "@/lib/prisma";

const updateBusinessSchema = z.object({
  name: z.string().min(2).optional(),
  website: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  voiceAgentId: z.union([z.string().min(5), z.literal(""), z.null()]).optional()
    .transform((value) => value === undefined ? undefined : value || null),
  chatAgentId: z.union([z.string().min(5), z.literal(""), z.null()]).optional()
    .transform((value) => value === undefined ? undefined : value || null)
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin();
    const id = parseId((await params).id);
    if (!id) throw new Error("Invalid business ID");
    const body = updateBusinessSchema.parse(await request.json());
    const business = await prisma.business.update({
      where: { id },
      data: body
    });

    return NextResponse.json({ business });
  } catch (error) {
    return handleRouteError(error);
  }
}
