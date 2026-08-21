# Case Study 0 — Project Overview & Architecture

**Project:** AI Chat + Call Widget MVP ("Business Help")
**Stack:** Next.js 15 (App Router API), React 19 + Vite admin panel, Prisma ORM, MySQL, Retell AI, Calendly
**Type:** Multi-tenant SaaS MVP — one deployable backend, many business tenants, one embeddable widget per business.

---

## 1. What the product does

Businesses sign in to a dashboard, configure **one AI agent** (name, tone, language, instructions), feed it **knowledge** (inline text or PDF uploads), and copy a **one-line embed script** onto their website. Website visitors can then:

- **Chat** with the AI agent (powered by Retell chat agents), and
- **Talk** to a voice agent via browser web-calls (Retell `create-web-call`).

Every interaction is captured as a **lead** (Contact), stored with full transcripts (Conversation / Call), and visible in the dashboard. Calendly bookings sync into the same pipeline so calls-to-action convert into scheduled meetings.

## 2. High-level architecture

```
┌────────────────────────┐        ┌──────────────────────────────┐
│  Customer website      │        │  React/Vite Admin Panel      │
│  <script widget.js>    │        │  (client/, port 5173)        │
└──────────┬─────────────┘        └──────────────┬───────────────┘
           │ JSON / CORS                          │ /api (proxied)
           ▼                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                Next.js 15 App Router API (app/api)               │
│  public:  /api/widget/*  /api/chat  /api/calls/start             │
│           /api/contacts/capture  /api/retell/webhook             │
│  private: /api/auth/*  /api/dashboard/*  /api/super-admin/*      │
│           /api/knowledge/*  /api/bookings/*                      │
└───────┬───────────────────┬──────────────────────┬──────────────┘
        │                   │                      │
        ▼                   ▼                      ▼
   ┌─────────┐        ┌───────────┐          ┌──────────┐
   │ MySQL   │        │ Retell AI │          │ Calendly │
   │(Prisma) │        │ chat+voice│          │ REST API │
   └─────────┘        └───────────┘          └──────────┘
```

### Layer responsibilities

| Layer | Location | Responsibility |
|---|---|---|
| Public widget | `public/widget.js` | Zero-dependency vanilla JS bubble; renders chat/call UI on any site |
| Public API | `app/api/chat`, `calls/start`, `widget/[businessId]` | Origin allowlist + widget-key checks, rate limiting, lead extraction |
| Webhooks | `app/api/retell/webhook` | HMAC-signed ingestion of call results |
| Auth & RBAC | `lib/auth.ts` | Cookie sessions (SHA-256 hashed tokens), role guards |
| Domain libs | `lib/*.ts` | Knowledge retrieval, LLM calls, voice, Calendly, validation, rate limit |
| Admin panel | `client/src` | React Router pages, Redux Toolkit store, Formik + Yup forms |
| Data | `prisma/schema.prisma` | 8 tables, auto-increment IDs, cascade deletes |

## 3. Data model (deliberately small)

Only five application tables carry the product:

1. **User** — super-admin/business-admin accounts; single active session stored on the row (`sessionTokenHash`, `sessionExpiresAt`).
2. **Business** — the tenant root: profile, AI settings (`agentName`, `agentInstructions`, `agentLanguage`, `agentTone`), provider IDs (`voiceAgentId`, `chatAgentId`), widget settings (`primaryColor`, `callEnabled`, `chatEnabled`, `publicKey`, `allowedOrigins`) and inline `knowledgeText`.
3. **Contact** — leads captured by the widget, deduplicated by `visitorToken`/email/phone.
4. **Conversation** — full chat history serialized into one `messagesJson` LONGTEXT column instead of a Message table.
5. **Call** — voice-call records keyed by `providerCallId`, enriched later by webhook (duration, transcript, recording URL, summary).

Supporting tables: **Booking** (Calendly events, unique `calendlyEventUuid`), **KnowledgeDoc** (uploaded PDF text), **AppSetting** (global key/value, e.g. shared default Retell LLM id).

## 4. Key architectural decisions

| Decision | Rationale |
|---|---|
| Next.js route handlers instead of a separate server | One deployable unit; API + static `widget.js` share an origin |
| Separate Vite SPA for the dashboard | Fast DX, clean component library, proxied `/api` in dev |
| Chat history as JSON blob | MVP simplicity — read/write whole transcript atomically, no joins |
| Single session per user (token hash on User row) | Instant revocation on logout/password change without a sessions table |
| Per-business Retell agents created lazily | No provider provisioning step during signup; first use self-heals |
| In-memory rate limiting | Zero infra for MVP; documented upgrade path to Redis |
| Auto-increment integer IDs | Human-readable demo data (`1, 2, 3`) for stakeholders |

## 5. Security posture (summary)

- Widget endpoints require **both** a matching `publicKey` **and** an `Origin` header present in the business's allowlist (website + extra origins); localhost bypass only outside production.
- Dynamic per-origin CORS reflection limited to allowed origins, with `Vary: Origin`.
- Rate limits: 60 config loads/min, 20 chat msgs/min, 3 calls/hour per business+IP.
- Retell webhook verified with HMAC-SHA256 signature + 5-minute timestamp window + timing-safe compare.
- Sessions: httpOnly, SameSite=Lax cookies; tokens stored only as SHA-256 hashes; expiry enforced server-side.
- All dashboard routes guarded by `requireBusinessAdmin` / `requireSuperAdmin`; every query scoped by `businessId`.

## 6. Outcome

The MVP delivers the full loop — **embed → converse → capture → review → book** — with production-minded controls (signature verification, origin pinning, rate limits, hashed credentials) while keeping the surface area small enough for a two-person team to operate.

See the individual case studies in this folder for feature-level deep dives:

1. `01-embeddable-widget.md` — distribution & security of the embed script
2. `02-ai-chat-engine.md` — Retell chat sessions, dynamic variables, local fallback
3. `03-voice-call-pipeline.md` — web-calls and signed webhook ingestion
4. `04-knowledge-base.md` — PDF/text knowledge and retrieval budgeting
5. `05-lead-capture.md` — regex-based lead extraction and contact resolution
6. `06-auth-security.md` — sessions, password flows, RBAC, tenancy isolation
7. `07-calendly-bookings.md` — booking sync and contact stitching
8. `08-admin-panel.md` — frontend architecture of the dashboard
