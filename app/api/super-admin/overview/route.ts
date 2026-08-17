import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireSuperAdmin();
  const [businesses, contacts, conversations, calls] = await Promise.all([
    prisma.business.count(),
    prisma.contact.count(),
    prisma.conversation.count(),
    prisma.call.count()
  ]);

  return NextResponse.json({ businesses, contacts, conversations, calls });
}
