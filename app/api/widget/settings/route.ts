import { NextResponse } from "next/server";
import { requireBusinessAdmin } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { bool, hexColor, jsonBody, maxLength, str } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireBusinessAdmin();
    const body = await jsonBody(request);
    const data: {
      welcomeMessage: string;
      primaryColor: string;
      chatEnabled: boolean;
      callEnabled: boolean;
      allowedOrigins?: string | null;
    } = {
      welcomeMessage: str(body.welcomeMessage, "welcomeMessage", 2),
      primaryColor: hexColor(body.primaryColor, "primaryColor"),
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