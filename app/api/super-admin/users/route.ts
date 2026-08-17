import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const createAdminSchema = z.object({
  businessId: z.coerce.number().int().positive(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = createAdminSchema.parse(await request.json());
    const user = await prisma.user.create({
      data: {
        businessId: body.businessId,
        name: body.name,
        email: body.email.toLowerCase(),
        passwordHash: await hashPassword(body.password),
        role: "BUSINESS_ADMIN"
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
