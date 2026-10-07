import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { handleRouteError } from "@/lib/http";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
