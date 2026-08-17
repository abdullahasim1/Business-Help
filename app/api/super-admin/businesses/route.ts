import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { email, jsonBody, str, strOrNull } from "@/lib/validation";

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
    const body = await jsonBody(request);
    const name = str(body.name, "name", 2);
    const website = strOrNull(body.website, "website");
    const adminName = str(body.adminName, "adminName", 2);
    const adminEmail = email(body.adminEmail);
    const adminPassword = str(body.adminPassword, "adminPassword", 8);
    const passwordHash = await hashPassword(adminPassword);

    const business = await prisma.business.create({
      data: {
        name,
        website: website || null,
        users: {
          create: {
            name: adminName,
            email: adminEmail,
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