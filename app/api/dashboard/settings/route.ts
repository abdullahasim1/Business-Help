import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireBusinessAdmin();
  const business = await prisma.business.findUnique({
    where: { id: user.businessId! },
    select: { name: true, website: true, status: true }
  });

  return NextResponse.json(business);
}
