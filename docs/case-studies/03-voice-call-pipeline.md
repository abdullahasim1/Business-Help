# Case Study 3 — Voice Call Pipeline (Retell Web-Calls + Signed Webhooks)

**Feature:** Browser-initiated AI phone calls with post-call transcript, recording, duration, and summary ingestion.
**Key files:** `app/api/calls/start/route.ts`, `lib/voice.ts`, `app/api/retell/webhook/route.ts`, `lib/retell-setup.ts`

---

## 1. Problem

Some visitors prefer talking over typing. The product needed:

- one-click voice calls from the widget **without Twilio numbers or SIP setup**,
- the same per-business persona (name, tone, language, knowledge) as chat,
- reliable capture of what happened on the call — even though calls end asynchronously, minutes after the visitor leaves.

## 2. Solution

### 2.1 Starting a call (`POST /api/calls/start`)

The widget's call form posts name/email/phone/service. The route then:

1. Validates input (`email()` format check, optional fields).
2. Gates on business `ACTIVE` + `callEnabled`.
3. Applies the origin/key allowlist.
4. Rate limits to **3 calls/hour** per business+IP (calls are expensive).
5. Resolves or creates the Contact from submitted fields.
6. Calls `startVoiceCall()` → Retell `/v2/create-web-call` with:
   - the business's `voiceAgentId`,
   - metadata `{businessId, contactId}` for later correlation,
   - `retell_llm_dynamic_variables` identical in shape to chat (instructions, contact summary, knowledge ≤ 12k chars, agent name, language, tone, booking URL).
7. Persists a Call row keyed by `providerCallId` and returns `{call_id, access_token}` so the widget can open the WebRTC session client-side.

### 2.2 Lazy agent provisioning

If no `voiceAgentId` exists yet, `ensureBusinessVoiceAgent()` creates it against the shared default LLM (voice `retell-Cimo`, en-US) and registers the app webhook URL when `NEXT_PUBLIC_APP_URL` is HTTPS. The id is saved on the Business row; subsequent calls skip provisioning entirely.

### 2.3 Mock mode

Without an API key or agent, `startVoiceCall()` returns a deterministic mock session (`mock_<uuid>`, mode `"unavailable"`). The widget still completes its flow in demos/dev, and the DB still records the attempt — no silent failures.

### 2.4 Result ingestion (`POST /api/retell/webhook`)

Retell fires `call_ended` / `call_analyzed` webhooks. The handler is deliberately paranoid:

```ts
const validSignature = (body, signature) => {
  // parse "v=<timestamp>,d=<hmac-sha256-hex>"
  // reject if |now - timestamp| > 5 minutes   (replay protection)
  // HMAC-SHA256(apiKey, body + timestamp)
  // timingSafeEqual(received, expected)       (no timing leaks)
};
```

- Reads the **raw body as text** before parsing — signature validity depends on exact bytes.
- Rejects non-matching signatures with 401 before any JSON.parse.
- Computes duration from `start_timestamp`/`end_timestamp` (seconds, clamped ≥ 0).
- Prefers Retell's own `call_analysis.call_summary`; falls back to "Call transcript saved."
- Updates via `prisma.call.updateMany({ where: { providerCallId } })` — idempotent across duplicate webhook deliveries of both event types.

## 3. Timeline

```
t0  Visitor submits call form ─▶ /api/calls/start
      ├─ guards + rate limit (3/hour)
      ├─ contact resolve/create
      ├─ ensureBusinessVoiceAgent (once)
      ├─ Retell create-web-call (dynamic vars, metadata)
      └─ Call row created (providerCallId) ──▶ widget joins WebRTC call
t1  Call ends ──▶ Retell webhook "call_ended"     ─▶ updateMany (duration/transcript/recording)
t2  Analysis done ──▶ Retell webhook "call_analyzed" ─▶ updateMany (+summary)
t3  Business admin sees full transcript & recording in dashboard Calls page
```

## 4. Key decisions & trade-offs

| Decision | Why |
|---|---|
| Web-calls instead of telephony | No phone numbers/minutes to manage; browser mic is enough for MVP |
| Metadata + providerCallId correlation | The webhook only knows Retell ids; storing `providerCallId` at start makes enrichment a single indexed lookup |
| `updateMany` not `update` | Duplicate/out-of-order webhooks converge instead of 404-ing |
| Timestamp window + timing-safe compare | Standard replay/hardening for public webhook endpoints |
| Summary fallback string | Rows are never left looking "broken" if analysis is delayed |

## 5. Outcome

A visitor clicks *Call us*, talks to a brand-consistent AI agent in-browser, and within minutes the dashboard shows duration, full transcript, recording link, and an AI-written summary — all matched back to the same Contact created at call start.
