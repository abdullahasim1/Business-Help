import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { calendlyConfigured, syncCalendlyBookings } from "@/lib/calendly";
import { handleRouteError, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireAdmin();
    const configured = calendlyConfigured();

    let synced = 0;
    if (configured) {
      try {
        synced = await syncCalendlyBookings();
      } catch (error) {
        return jsonError(error instanceof Error ? error.message : "Calendly sync failed", 502);
      }
    }

    const bookings = await prisma.booking.findMany({
      where: user.businessId ? { businessId: user.businessId } : {},
      orderBy: { startTime: "desc" },
      take: 200,
      select: {
        id: true,
        calendlyEventUuid: true,
        eventName: true,
        inviteeName: true,
        inviteeEmail: true,
        inviteeTimezone: true,
        startTime: true,
        endTime: true,
        businessId: true,
        business: { select: { name: true } },
        contactId: true
      }
    });

    return NextResponse.json({ configured, synced, bookings });
  } catch (error) {
    return handleRouteError(error);
  }
}