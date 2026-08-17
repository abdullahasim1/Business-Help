# AI Chat + Call Widget MVP

A small production-minded MVP for businesses to configure one AI agent, add knowledge, capture leads, and embed a chat/call widget on external websites.

## Quick Start

1. Set your MySQL connection, `SESSION_SECRET`, and a private `SEED_PASSWORD` in `.env`.
2. Install dependencies with `npm install`.
3. For a new database, run `database/mysql-database.sql` in DBeaver first, then create and seed the app data with `npm run db:setup`.
4. Start the app with `npm run dev`.

The local database is MySQL and is named `ai_widget_mvp`. Every table uses simple auto-increment IDs: `1`, `2`, `3`.

## Simple database structure

The project intentionally uses only five application tables:

- `Business` — business profile, AI settings, widget settings, and knowledge text
- `User` — super admin/business admin accounts and their active session
- `Contact` — widget leads
- `Conversation` — chat history stored in one JSON field
- `Call` — voice-call records

## MySQL for production

DBeaver is a database client; it does not install or configure the MySQL server. Connect to the local MySQL server using `widget_user`, port `3306`, and the password configured in `.env`. The project is already set up for the `ai_widget_mvp` database.

For normal deployments, use `database/mysql-database.sql` and then `npm run db:migrate` so Prisma uses the tracked five-table baseline migration. `database/mysql-schema.sql` is only for a full DBeaver import; after using it, run `npm run db:seed` (not `db:migrate`).

The demo seed requires `SEED_PASSWORD`; it never contains a password in source code. Do not run the demo seed in production.

## Embed Code

```html
<script src="https://YOUR_DOMAIN.com/widget.js" data-business-id="1" data-widget-key="YOUR_WIDGET_KEY"></script>
```

Copy the exact code from the dashboard Widget page. The widget only works on the business website and any additional allowed origins configured there.

## Voice calls

For live Retell calls, add the business-specific Retell voice agent ID on the Super Admin Businesses page, and configure that Retell agent to send `call_ended` and `call_analyzed` webhooks to:

```text
https://YOUR_DOMAIN.com/api/retell/webhook
```

The webhook verifies Retell's signature, then saves the completed call duration, transcript, recording URL, and summary. It uses Retell's call analysis when available.

## React admin panel (`client/`)

The admin panel is a separate React (Vite) app in `client/` that talks to the Next.js API above. It uses React Router, Formik + Yup for form validation, and small reusable components (`Field`, `MetricCard`, `Layout`).

```bash
cd client
npm install
npm run dev        # http://localhost:5173, proxies /api to the Next.js backend
```

For production, build with `npm run build` and serve `dist/` with a reverse proxy that also forwards `/api` and `/widget.js` to the Next.js server.

## Chat

Chat replies also come from Retell. Super Admin sets the business-specific Retell **chat agent ID** on the Businesses page (Private AI setup). The app creates a Retell chat session per visitor conversation (`/create-chat`) and sends each message with `/create-chat-completion`.

Build the chat agent prompt in the Retell dashboard. The app injects these dynamic variables on every session, which the prompt can reference as `{{business_knowledge}}`, `{{agent_name}}`, `{{language}}`, `{{tone}}`, and `{{welcome_message}}`. If no chat agent ID is set, the widget falls back to a simple local keyword answer so development keeps working.
