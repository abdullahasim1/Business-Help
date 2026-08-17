import { prisma } from "@/lib/prisma";

type CalendlyEvent = {
  uri: string;
  name?: string;
  start_time: string;
  end_time: string;
  status?: string;
};

type CalendlyInvitee = {
  uri: string;
  email?: string;
  name?: string;
  timezone?: string;
};

let lastSyncAt = 0;
let lastSyncCount = 0;
const SYNC_CACHE_MS = 5 * 60_000;

export function calendlyConfigured(): boolean {
  return Boolean(process.env.CALENDLY_API_TOKEN);
}

export async function syncCalendlyBookings(force = false): Promise<number> {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) return 0;

  if (!force && Date.now() - lastSyncAt < SYNC_CACHE_MS) return lastSyncCount;

  const userResponse = await fetch("https://api.calendly.com/users/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!userResponse.ok) throw new Error("Calendly token is invalid or expired");
  const me = (await userResponse.json()) as { resource?: { uri?: string } };
  const userUri = me.resource?.uri;
  if (!userUri) throw new Error("Could not resolve Calendly user");

  const from = new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString();
  const url = new URL("https://api.calendly.com/scheduled_events");
  url.searchParams.set("user", userUri);
  url.searchParams.set("status", "active");
  url.searchParams.set("min_start_time", from);
  url.searchParams.set("count", "100");

  const eventsResponse = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!eventsResponse.ok) throw new Error("Could not fetch Calendly events");
  const events = (await eventsResponse.json()) as { collection?: CalendlyEvent[] };
  if (!events.collection?.length) {
    lastSyncAt = Date.now();
    lastSyncCount = 0;
    return 0;
  }

  let synced = 0;
  for (const event of events.collection) {
    const uuid = event.uri.split("/").pop();
    if (!uuid) continue;

    const inviteeResponse = await fetch(`${event.uri}/invitees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!inviteeResponse.ok) continue;
    const invitees = (await inviteeResponse.json()) as { collection?: CalendlyInvitee[] };
    const invitee = invitees.collection?.[0];

    const contact = invitee?.email
      ? await prisma.contact.findFirst({
          where: { email: invitee.email.toLowerCase() },
          orderBy: { createdAt: "desc" }
        })
      : null;

    await prisma.booking.upsert({
      where: { calendlyEventUuid: uuid },
      create: {
        calendlyEventUuid: uuid,
        businessId: contact?.businessId ?? 1,
        contactId: contact?.id ?? null,
        eventName: event.name ?? null,
        inviteeName: invitee?.name ?? null,
        inviteeEmail: invitee?.email ?? null,
        inviteeTimezone: invitee?.timezone ?? null,
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time)
      },
      update: {
        inviteeName: invitee?.name ?? null,
        inviteeEmail: invitee?.email ?? null,
        inviteeTimezone: invitee?.timezone ?? null,
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time)
      }
    });
    synced++;
  }

  lastSyncAt = Date.now();
  lastSyncCount = synced;
  return synced;
}