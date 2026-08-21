# Case Study 6 — Authentication, RBAC & Multi-Tenant Security

**Feature:** Login, forgot/reset password, change password, session management, role guards, and tenant isolation.
**Key files:** `lib/auth.ts`, `lib/password.ts`, `app/api/auth/*`, `app/api/super-admin/*`, `client/src/routes/AuthGuard.tsx`

---

## 1. Problem

Two distinct personas use the system:

- **Super Admin** — platform operator managing all businesses and users;
- **Business Admin** — a customer who must see *only their own* data.

The MVP needed real credential handling (hashing, reset flows, forced first-login changes) without the operational weight of an identity provider, plus airtight isolation so one business can never read another's leads, transcripts, or settings.

## 2. Solution

### 2.1 Passwords (`lib/password.ts`)

- Hashing via Node's native `scrypt` (salted), constant-time verification.
- **Reset tokens are stored hashed** (`resetToken` unique column holds the hash; the raw token exists only in the email link) with `resetTokenExpiresAt` expiry.
- `mustChangePassword` flag forces seeded/demo users to set their own password on first login (the seed never embeds passwords in source; it reads private `SEED_PASSWORD` from env).

### 2.2 Sessions as hashed tokens on the user row

`createSession()` generates a 32-byte base64url token, stores only its **SHA-256 hash** in `User.sessionTokenHash` with a 30-day expiry, and sets a cookie:

```
ai_widget_session = <token>; HttpOnly; SameSite=Lax; Secure (prod); Path=/
```

Why this design:

| Property | How |
|---|---|
| DB leak ≠ session theft | Hashed tokens; raw values never persisted |
| Instant revocation | Logout / password change / reset nulls the row — no token list to sweep |
| One active session per user | Column (not table) enforces "last login wins" simply |
| Expired-session cleanup | `getSessionUser` clears stale hashes on access |

### 2.3 Role guards

Four composable helpers encode every rule once:

```ts
requireUser()          // any authenticated user
requireAdmin()         // SUPER_ADMIN or BUSINESS_ADMIN
requireBusinessAdmin() // BUSINESS_ADMIN with businessId (super admins redirected away)
requireSuperAdmin()    // SUPER_ADMIN only
```

Every dashboard/super-admin API route calls one of these before touching data.

### 2.4 Tenant isolation patterns

- **Scoping at query time:** every Prisma query on tenant data includes `where: { businessId: user.businessId }` — counts, lists, recent items in `/api/dashboard`, knowledge docs, conversations by id (`findFirst({ id, businessId })`).
- **Deletes scoped too:** `deleteMany({ where: { id, businessId } })` for knowledge docs; conversation fetch joins on both id *and* visitorToken for public endpoints.
- **Cascade hygiene:** schema-level `onDelete: Cascade` from Business → Contacts/Conversations/Calls/Bookings/KnowledgeDocs means removing a tenant removes its PII completely; Contact links use `SetNull` to preserve history shape.
- Super-admin routes (`/api/super-admin/businesses`, `/users`, `/overview`) are the only places allowed to address businesses by arbitrary id — and they require `SUPER_ADMIN`.

### 2.5 Auth surface (`app/api/auth/*`)

| Endpoint | Behavior |
|---|---|
| `login` | Verify scrypt hash → create session; honors `mustChangePassword` |
| `logout` | Nulls session hash + deletes cookie |
| `me` | Returns current SessionUser (id, name, email, role, businessId) |
| `forgot-password` | Issues hashed, expiring reset token |
| `reset-password` | Validates token hash + expiry, rotates password, clears session |
| `change-password` | Requires current password; used by forced first-login flow |

The React side mirrors this with public auth pages (`Login`, `ForgotPassword`, `ResetPassword`, `SetNewPassword`) behind `AuthGuard` route protection, and a Redux `userSlice` holding the session user.

## 3. Threat model coverage

| Threat | Mitigation |
|---|---|
| Stolen DB dump | scrypt password hashes; SHA-256 session & reset tokens |
| Session fixation/replay | Fresh random token per login; server-side expiry; httpOnly cookie |
| IDOR across tenants | businessId-scoped queries everywhere; fail-closed 403s on mismatch |
| Privilege escalation | Single-point role guards; super-admin routes isolated |
| Weak seeded credentials | No passwords in source; `SEED_PASSWORD` env-only; forced change flag |

## 4. Trade-offs

Single-session-per-user means two browsers can't stay logged in simultaneously — accepted for MVP simplicity. In-memory rate limiting and env-based secrets are documented upgrade paths. The payoff: zero external identity dependency, ~100 lines of auth core, and revocation semantics stronger than most JWT setups.

## 5. Outcome

A platform operator can onboard businesses and create their admin logins (with forced password rotation) while each customer enjoys a private dashboard — confident that leads, transcripts, and knowledge are visible only inside their own tenant.
