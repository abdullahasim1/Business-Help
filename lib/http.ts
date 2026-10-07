import { NextResponse } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/lib/auth";
import { ValidationError } from "@/lib/validation";

export function jsonError(message: string, status = 400, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export function handleRouteError(error: unknown, headers?: HeadersInit) {
  if (error instanceof UnauthorizedError) {
    return jsonError(error.message, error.status, headers);
  }

  if (error instanceof ForbiddenError) {
    return jsonError(error.message, error.status, headers);
  }

  if (error instanceof ValidationError) {
    return jsonError(error.message, 422, headers);
  }

  if (error instanceof Error && error.message.includes("not allowed")) {
    return jsonError(error.message, 422, headers);
  }

  console.error(error);
  return jsonError("Something went wrong", 500, headers);
}
