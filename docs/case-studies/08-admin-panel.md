# Case Study 8 — React Admin Panel (client/)

**Feature:** The business/super-admin dashboard SPA: auth pages, metrics, conversations, calls, contacts, bookings, knowledge, agent & widget settings.
**Key files:** `client/src/*` (pages, components, routes, store, lib)

---

## 1. Problem

The Next.js backend intentionally ships no admin UI. The dashboard needed to be:

- fast to iterate on (separate from API deploys),
- consistent across ~15 screens,
- form-heavy (settings, knowledge, auth flows) with real validation,
- role-aware (business admin vs. super admin).

## 2. Solution

### 2.1 Stack

| Concern | Choice |
|---|---|
| Build | Vite + React 19 + TypeScript |
| Routing | React Router with nested layouts (`PublicLayout` for auth, `AuthGuard` for app) |
| State | Redux Toolkit (`userSlice` for session user) + RTK Query patterns in `lib/hooks.ts` |
| Forms | Formik + Yup schemas centralized in `lib/validations.ts` |
| Styling | Tailwind CSS |

Dev server runs on `:5173` and **proxies `/api` to the Next.js backend**, so cookies and CORS behave identically to production, where a reverse proxy forwards `/api` and `/widget.js`.

### 2.2 Reusable component system

Small, composable primitives keep screens uniform:

- `Layout`, `PageContainer`, `PageHeader` — shell and page scaffolding
- `Field`, `Input`, `FormikForm` — validated forms with shared control classes (`formControlClasses`)
- `MetricCard`, `StatsCards` — dashboard KPIs (contacts / conversations / calls counts)
- `TableShell`, `StatusPill`, `EmptyState`, `Loader`, `ErrorBanner` — data views with loading/error/empty states handled the same way everywhere
- `AuthLayout`, `Button` — public flow consistency

Dashboard-specific composites: `QuickActions`, `LaunchChecklist` (onboarding progress), `WidgetDemo` (live preview of the embed).

### 2.3 Screen inventory

| Route group | Screens | Backing API |
|---|---|---|
| Auth | Login, ForgotPassword, ResetPassword, SetNewPassword | `/api/auth/*` |
| Dashboard | Stats, recent leads/conversations, checklist | `/api/dashboard` |
| Conversations | List + transcript detail viewer | `/api/dashboard/conversations[/id]` |
| Calls | Duration, summary, recording links | `/api/dashboard/calls` |
| Contacts | Lead table, statuses, service interest | `/api/dashboard/contacts` |
| Bookings | Calendly-synced meetings | `/api/bookings(/sync)` |
| Knowledge | Inline text editor + PDF upload/delete | `/api/knowledge*` |
| Agent | Name, instructions, language, tone, status | `/api/agent`, `/api/dashboard/agent` |
| Widget | Embed code copy, color, toggles, origins | `/api/widget/settings`, `/api/dashboard/widget` |
| Settings | Password change | `/api/auth/change-password` |
| Super Admin | Overview, Businesses CRUD (+ Retell agent ids), Users | `/api/super-admin/*` |

### 2.4 API layer discipline

`lib/api.ts` centralizes fetch handling (JSON parsing, error normalization, credentials), while `lib/hooks.ts` wraps data fetching/loading/error state so pages stay declarative. `lib/conversations.ts` formats stored JSON transcripts for display.

## 3. Example flow — editing the AI agent

```
Agent.tsx ──▶ Formik(form + Yup schema)
   onSubmit ──▶ api.put("/api/agent", values)
                  ──▶ requireBusinessAdmin() guard
                  ──▶ prisma.business.update({ where: { id: user.businessId } })
   success ──▶ toast + refetch ──▶ next visitor message uses new persona
```

## 4. Key decisions & trade-offs

| Decision | Why |
|---|---|
| Separate Vite SPA | Independent iteration/deploy from API; instant HMR; no SSR complexity for an authenticated tool |
| Central Yup schemas | Validation rules live once, mirrored by server-side `lib/validation.ts` |
| Tiny component vocabulary | New screens assemble from known parts; visual drift stays near zero |
| Proxy-based dev auth | No token juggling locally — same cookie behavior as prod |
| Redux only for session user | Server state stays in hooks; avoids global-cache over-engineering at this size |

## 5. Outcome

A non-technical business admin can onboard themselves end-to-end — configure their agent, upload a PDF, copy an embed snippet, watch leads/transcripts/bookings arrive, and hand the widget key to their web developer — entirely through a consistent, validated, role-aware interface.
