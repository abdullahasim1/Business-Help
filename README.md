# AI Chat + Call Widget MVP

A production-minded, multi-tenant MVP: businesses configure one AI agent, add knowledge (text or PDFs), capture leads, and embed a chat/voice-call widget on external websites.

**Stack:** Next.js 15 (App Router API, TypeScript) · React 19 + Vite admin panel (`client/`) · Prisma 6 + MySQL · Retell AI (chat + voice calls) · Calendly bookings sync.

## Setup

### 1. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | MySQL connection string, e.g. `mysql://widget_user:password@127.0.0.1:3306/ai_widget_mvp` |
| `RETELL_API_KEY` | yes (for AI features) | Retell AI API key — powers chat sessions, voice calls, and webhook verification |
| `CALENDLY_API_TOKEN` | optional | Enables Calendly booking sync into the lead pipeline |
| `NEXT_PUBLIC_APP_URL` | yes | Public URL of this app, e.g. `http://localhost:3000` (used for widget origin checks) |
| `SEED_PASSWORD` | dev only | Password for the demo seed accounts; never used in production |

### 2. Install dependencies

```bash
npm install
```

### 3. Create the database

Migrations live in `prisma/migrations/` (six tracked migrations, MySQL baseline included):

```bash
npm run db:migrate   # applies pending migrations
```

### 4. Seed demo data (development only)

```bash
npm run db:seed      # requires SEED_PASSWORD; refuses to run in production
```

This creates a super admin (`super@example.com`), a business admin (`admin@abcsolar.test`), and two demo businesses.

Or do steps 2–4 in one go:

```bash
npm run db:setup
```

### 5. Run

```bash
npm run dev          # Next.js API on http://localhost:3000
```

The embeddable widget is served statically at `/widget.js`.

## Retell AI setup

For live AI chat and voice calls:

1. Create a Retell chat agent and a Retell voice agent in the [Retell dashboard](https://dashboard.retellai.com), then set `RETELL_API_KEY` in `.env`.
2. On the Super Admin → Businesses page, assign the per-business Retell chat/voice agent IDs.
3. Point the Retell voice agent's `call_ended` and `call_analyzed` webhooks to:

```text
https://YOUR_DOMAIN.com/api/retell/webhook
```

The webhook verifies Retell's HMAC signature, then saves call duration, transcript, recording URL, and summary. If no chat agent ID is set, the widget falls back to a simple local keyword answer so development keeps working.

The chat prompt supports these dynamic variables, injected per session: `{{business_knowledge}}`, `{{agent_name}}`, `{{language}}`, `{{tone}}`, `{{welcome_message}}`.

## Embed code

```html
<script src="https://YOUR_DOMAIN.com/widget.js" data-business-id="1" data-widget-key="YOUR_WIDGET_KEY"></script>
```

Copy the exact snippet from the dashboard Widget page. The widget only loads on the business website and any additional allowed origins configured there; requests are key-checked, origin-pinned, and rate-limited.

## React admin panel (`client/`)

The admin panel is a separate React (Vite) app in `client/` that talks to the Next.js API. It uses React Router, Redux Toolkit, and Formik + Yup, with small reusable components.

```bash
cd client
npm install
npm run dev        # http://localhost:5173, proxies /api to the Next.js backend
```

For production, build with `npm run build` and serve `dist/` behind a reverse proxy that also forwards `/api` and `/widget.js` to the Next.js server.

## Database model

Eight Prisma models (`prisma/schema.prisma`): `User` (super/business admins, single active session), `Business` (tenant root: profile, AI settings, widget settings, knowledge), `Contact` (captured leads), `Conversation` (chat history as one JSON field), `Call` (voice-call records), `Booking` (Calendly events), `KnowledgeDoc` (uploaded PDF text), `AppSetting` (global key/value).

## API notes

All dashboard routes are guarded by role-based auth (`requireBusinessAdmin` / `requireSuperAdmin` in `lib/auth.ts`) and return JSON error responses via the centralized `handleRouteError` in `lib/http.ts` — unauthenticated API requests get a `401` JSON body, not an HTML redirect.

## Docs

`docs/case-studies/` contains technical write-ups of each feature (widget, chat engine, voice pipeline, knowledge base, lead capture, auth/security, bookings, admin panel).

## License

MIT — see [LICENSE](LICENSE).
