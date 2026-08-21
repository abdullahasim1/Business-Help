# Case Study 7 — Calendly Bookings Sync

**Feature:** Pull scheduled Calendly events into the platform and stitch them to existing widget leads.
**Key files:** `lib/calendly.ts`, `app/api/bookings/route.ts`, `app/api/bookings/sync/route.ts`

---

## 1. Problem

The AI agent hands visitors a booking link (`business.calendlyUrl` injected as `{{booking_url}}`). But once a visitor books on Calendly, that event lives outside the platform — the business dashboard would show conversations and calls with no visibility into the resulting meetings, breaking the lead-to-meeting funnel story.

Requirements:

- No webhook infrastructure for the MVP (Calendly webhooks need verified endpoints + rotation).
- Idempotent syncs (no duplicate bookings on repeated pulls).
- Match bookings back to widget-captured Contacts where possible.

## 2. Solution

### 2.1 Polling sync with soft caching (`syncCalendlyBookings`)

1. **Config gate** — returns 0 immediately if `CALENDLY_API_TOKEN` is unset; feature is optional per deployment.
2. **5-minute in-process cache** (`lastSyncAt`/`lastSyncCount`) — repeated dashboard loads don't hammer Calendly; `force=true` bypasses for manual refresh.
3. **Identity resolution** — `GET /users/me` resolves the token's user URI (also validating the token early with a clear error).
4. **Windowed fetch** — active scheduled events from the last **30 days**, `count=100`.
5. **Per-event invitee enrichment** — `GET {event}/invitees` for name/email/timezone.
6. **Contact stitching** — invitee email is matched (case-insensitive, newest first) against existing Contacts; the booking inherits that contact's `businessId`, or defaults to business `1` when unmatched.
7. **Idempotent upsert** — `calendlyEventUuid` is unique; upsert updates times/invitee fields on re-sync instead of duplicating.

### 2.2 API surface

- `POST /api/bookings/sync` — triggers a sync (admin-guarded), returns count synced.
- `GET /api/bookings` — lists bookings for the admin's business (scoped by `businessId`), powering the Bookings page with event name, invitee, timezone, start/end times.

## 3. Flow

```
Visitor chats ──▶ agent shares {{booking_url}} ──▶ visitor books on Calendly
                                                        │
Dashboard load / manual refresh ──▶ POST /api/bookings/sync
    ├─ cache fresh? ──▶ return last count
    ├─ Calendly /users/me ──▶ user uri
    ├─ Calendly /scheduled_events (active, last 30d)
    ├─ per event: /invitees ──▶ email match ──▶ Contact
    └─ Booking.upsert(calendlyEventUuid) ──▶ dashboard Bookings page
```

## 4. Key decisions & trade-offs

| Decision | Why |
|---|---|
| Polling over webhooks | Zero public endpoint/verification burden; adequate at MVP volume |
| 30-day lookback window | Captures recent + upcoming meetings without unbounded history |
| Email-based contact matching | Reuses the same identity signal captured during chat; no new matching logic |
| Default businessId = 1 fallback | Single-business deployments "just work"; multi-tenant installs should configure matching emails |
| Upsert on UUID | Safe under retries, force-refreshes, and overlapping syncs |

## 5. Outcome

The dashboard closes the loop: a conversation shows the visitor asking about services, the Contacts page shows their captured details, and the Bookings page shows the meeting they scheduled — all correlated through one email address, with no manual data entry or webhook plumbing.
