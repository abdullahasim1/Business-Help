import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const createBusinessSchema = z.object({
  name: z.string().min(2),
  website: z.string().optional().nullable(),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8)
});

export async function GET() {
  await requireSuperAdmin();
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      website: true,
      status: true,
      createdAt: true,
      users: { select: { name: true, email: true } }
    }
  });

  return NextResponse.json(businesses);
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = createBusinessSchema.parse(await request.json());
    const passwordHash = await hashPassword(body.adminPassword);

    const business = await prisma.business.create({
      data: {
        name: body.name,
        website: body.website || null,
        users: {
          create: {
            name: body.adminName,
            email: body.adminEmail.toLowerCase(),
            passwordHash,
            role: "BUSINESS_ADMIN"
          }
        },
        agentName: "Sarah AI",
        agentInstructions:
          "You are a helpful AI assistant. Answer questions using the business knowledge provided. Never invent information."
      }
    });

    return NextResponse.json({ business });
  } catch (error) {
    return handleRouteError(error);
  }
}
