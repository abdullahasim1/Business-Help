import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const business = await prisma.business.findFirst({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, publicKey: true }
  });

  return NextResponse.json(business);
}
