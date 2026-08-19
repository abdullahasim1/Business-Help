import { NextResponse } from "next/server";
import { handleRouteError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { jsonBody, email as validateEmail } from "@/lib/validation";
import { randomBytes } from "node:crypto";
import { addHours } from "date-fns";

export async function POST(request: Request) {
  try {
    const body = await jsonBody(request);
    const userEmail = validateEmail(body.email);

    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (user) {
      const resetToken = randomBytes(32).toString("base64url");
      const expiresAt = addHours(new Date(), 1);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiresAt: expiresAt
        }
      });

      console.log(`Password reset token for ${userEmail}: ${resetToken}`);
    }

    return NextResponse.json({ ok: true, message: "If the email exists, a reset link has been sent." });
  } catch (error) {
    return handleRouteError(error);
  }
}