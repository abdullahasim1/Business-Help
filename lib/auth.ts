import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { Role, type User } from "@prisma/client";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "ai_widget_session";
const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

// Thrown by the require* guards below. Route handlers catch these via
// handleRouteError() in lib/http.ts, so API clients get JSON (401/403)
// instead of a 307 HTML redirect from next/navigation.
export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Not authorized") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export type SessionUser = Pick<User, "id" | "name" | "email" | "role" | "businessId">;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS);

  await prisma.user.update({
    where: { id: userId },
    data: {
      sessionTokenHash: hashToken(token),
      sessionExpiresAt: expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.user.updateMany({
      where: { sessionTokenHash: hashToken(token) },
      data: { sessionTokenHash: null, sessionExpiresAt: null }
    });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const user = await prisma.user.findFirst({
    where: { sessionTokenHash: hashToken(token) }
  });

  if (!user || !user.sessionExpiresAt || user.sessionExpiresAt < new Date()) {
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { sessionTokenHash: null, sessionExpiresAt: null }
      });
    }
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessId: user.businessId
  };
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== Role.BUSINESS_ADMIN && user.role !== Role.SUPER_ADMIN) {
    throw new ForbiddenError("Admin access required");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.role !== Role.SUPER_ADMIN) throw new ForbiddenError("Super admin access required");
  return user;
}

export async function requireBusinessAdmin() {
  const user = await requireUser();
  if (user.role !== Role.BUSINESS_ADMIN || !user.businessId) {
    throw new ForbiddenError("Business admin access required");
  }
  return user;
}
