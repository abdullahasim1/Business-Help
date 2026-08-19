import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/http";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { allowRequest, requestIp } from "@/lib/rate-limit";
import { email, jsonBody, str } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await jsonBody(request);
    const userEmail = email(body.email);
    const password = str(body.password, "password");
    const ip = requestIp(request);
    const key = `login:${ip}:${userEmail}`;
    if (!allowRequest(key, 5, 60_000) || !allowRequest(`login-ip:${ip}`, 20, 60_000)) {
      return jsonError("Too many login attempts. Please try again in 1 minute.", 429);
    }
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, mustChangePassword: user.mustChangePassword });
  } catch (error) {
    return handleRouteError(error);
  }
}