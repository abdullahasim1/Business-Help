import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { bool, jsonBody, maxLength, str } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireBusinessAdmin();
    const body = await jsonBody(request);
    const data: {
      chatEnabled: boolean;
      callEnabled: boolean;
      allowedOrigins?: string | null;
    } = {
      chatEnabled: bool(body.chatEnabled, "chatEnabled"),
      callEnabled: bool(body.callEnabled, "callEnabled")
    };
    if (body.allowedOrigins !== undefined) {
      data.allowedOrigins =
        body.allowedOrigins === null ? null : maxLength(str(body.allowedOrigins, "allowedOrigins"), 2000, "allowedOrigins");
    }
    const business = await prisma.business.update({
      where: { id: user.businessId! },
      data
    });

    return NextResponse.json({ business });
  } catch (error) {
    return handleRouteError(error);
  }
}