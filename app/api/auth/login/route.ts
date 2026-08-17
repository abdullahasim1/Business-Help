import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/http";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { allowRequest, requestIp } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const ip = requestIp(request);
    const key = `login:${ip}:${body.email.toLowerCase()}`;
    if (!allowRequest(key, 5, 15 * 60_000) || !allowRequest(`login-ip:${ip}`, 20, 15 * 60_000)) {
      return jsonError("Too many login attempts. Please try again in 15 minutes.", 429);
    }
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
