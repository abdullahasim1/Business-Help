import { NextResponse } from "next/server";
import { calendlyConfigured, syncCalendlyBookings } from "@/lib/calendly";
import { handleRouteError, jsonError } from "@/lib/http";

export async function POST() {
  try {
    if (!calendlyConfigured()) {
      return jsonError("Calendly API token is not configured", 400);
    }
    const synced = await syncCalendlyBookings(true);
    return NextResponse.json({ ok: true, synced });
  } catch (error) {
    return handleRouteError(error);
  }
}