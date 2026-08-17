import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { email, jsonBody, positiveInt, str } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await jsonBody(request);
    const businessId = positiveInt(body.businessId, "businessId");
    const name = str(body.name, "name", 2);
    const adminEmail = email(body.email);
    const password = str(body.password, "password", 8);
    const user = await prisma.user.create({
      data: {
        businessId,
        name,
        email: adminEmail,
        passwordHash: await hashPassword(password),
        role: "BUSINESS_ADMIN"
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}