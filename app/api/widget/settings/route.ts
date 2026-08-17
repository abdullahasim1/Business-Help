import { NextResponse } from "next/server";
import { z } from "zod";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const widgetSchema = z.object({
  welcomeMessage: z.string().min(2),
  primaryColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  chatEnabled: z.boolean(),
  callEnabled: z.boolean(),
  allowedOrigins: z.string().max(2000).optional().nullable()
});

export async function POST(request: Request) {
  try {
    const user = await requireBusinessAdmin();
    const body = widgetSchema.parse(await request.json());
    const business = await prisma.business.update({
      where: { id: user.businessId! },
      data: body
    });

    return NextResponse.json({ business });
  } catch (error) {
    return handleRouteError(error);
  }
}
