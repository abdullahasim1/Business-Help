import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/http";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { jsonBody, str } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await jsonBody(request);
    const currentPassword = str(body.currentPassword, "currentPassword");
    const newPassword = str(body.newPassword, "newPassword", 8);
    const confirmPassword = str(body.confirmPassword, "confirmPassword");

    if (newPassword !== confirmPassword) {
      return jsonError("Passwords do not match", 400);
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return jsonError("User not found", 404);
    }

    const isFirstTime = dbUser.mustChangePassword;
    if (!isFirstTime) {
      const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
      if (!valid) {
        return jsonError("Current password is incorrect", 401);
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: false
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}