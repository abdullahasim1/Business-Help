import { NextResponse } from "next/server";

export function publicCorsHeaders(origin?: string): Record<string, string> {
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin"
  };
}

export function corsJson(data: unknown, init?: ResponseInit, origin?: string) {
  const headers = new Headers(init?.headers);
  for (const [name, value] of Object.entries(publicCorsHeaders(origin))) headers.set(name, value);

  return NextResponse.json(data, {
    ...init,
    headers
  });
}

export function corsOptions(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: publicCorsHeaders(request.headers.get("origin") || undefined)
  });
}
