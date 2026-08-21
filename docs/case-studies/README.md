# Business Help — Case Studies

Technical case studies for the **AI Chat + Call Widget MVP**: how each feature was designed, built, and secured.

## Reading order

| # | Case study | Focus |
|---|---|---|
| 0 | [Project Overview & Architecture](./00-project-overview.md) | System map, data model, key decisions |
| 1 | [Embeddable AI Widget](./01-embeddable-widget.md) | One-line embed, origin pinning, CORS |
| 2 | [AI Chat Engine](./02-ai-chat-engine.md) | Retell chat sessions, dynamic variables, fallback |
| 3 | [Voice Call Pipeline](./03-voice-call-pipeline.md) | Web-calls + HMAC-signed webhook ingestion |
| 4 | [Knowledge Base](./04-knowledge-base.md) | PDF/text ingestion, bounded retrieval |
| 5 | [Lead Capture](./05-lead-capture.md) | Regex extraction, contact resolution ladder |
| 6 | [Auth & Multi-Tenant Security](./06-auth-security.md) | Sessions, RBAC, tenant isolation |
| 7 | [Calendly Bookings](./07-calendly-bookings.md) | Polling sync, idempotent upserts |
| 8 | [React Admin Panel](./08-admin-panel.md) | SPA architecture, component system |

## Stack summary

Next.js 15 (App Router API routes) · React 19 + Vite admin SPA · Prisma + MySQL · Retell AI (chat + voice agents) · Calendly API · Tailwind CSS · Formik/Yup · Redux Toolkit
