import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export function handleRouteError(error: unknown, headers?: HeadersInit) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid request", 422, headers);
  }

  if (error instanceof Error && error.message.includes("not allowed")) {
    return jsonError(error.message, 422, headers);
  }

  console.error(error);
  return jsonError("Something went wrong", 500, headers);
}
