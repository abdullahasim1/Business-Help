import { NextResponse } from "next/server";
import { handleRouteError, jsonError } from "@/lib/http";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { jsonBody, str } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await jsonBody(request);
    const token = str(body.token, "token");
    const newPassword = str(body.newPassword, "newPassword", 8);
    const confirmPassword = str(body.confirmPassword, "confirmPassword");

    if (newPassword !== confirmPassword) {
      return jsonError("Passwords do not match", 400);
    }

    const user = await prisma.user.findFirst({
      where: { resetToken: token }
    });

    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      return jsonError("Invalid or expired reset token", 400);
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false,
        resetToken: null,
        resetTokenExpiresAt: null
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}