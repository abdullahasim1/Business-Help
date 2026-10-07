import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const business = await prisma.business.findFirst({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, publicKey: true }
    });

    return NextResponse.json(business);
  } catch (error) {
    return handleRouteError(error);
  }
}
