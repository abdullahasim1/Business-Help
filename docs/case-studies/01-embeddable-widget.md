# Case Study 1 — The Embeddable AI Widget

**Feature:** One-line `<script>` embed that installs a chat + call widget on any external website.
**Key files:** `public/widget.js`, `app/api/widget/[businessId]/route.ts`, `lib/public-widget.ts`, `lib/cors.ts`

---

## 1. Problem

The product's value depends on distribution: each business must be able to install the AI agent on *their own* website with zero build tooling, while the backend must refuse to serve the widget to anyone else (competitors embedding someone else's agent, scraped keys, phishing sites).

Constraints:

- No framework assumptions on the host page (WordPress, Shopify, plain HTML).
- No global namespace pollution or style clashes.
- Per-business branding (primary color) and feature flags (chat on/off, call on/off).
- Hard origin pinning in production.

## 2. Solution

### 2.1 Zero-dependency vanilla JS loader (`public/widget.js`)

The widget is a single IIFE (~325 lines) served as a static file. It:

1. Reads `data-business-id` and `data-widget-key` from its own `<script>` tag via `document.currentScript`.
2. Derives the API origin from `script.src` — so the same file works on any deployment domain without configuration.
3. Injects a scoped `<style>` block; every rule is namespaced under `#ai-widget-root` / `.aiw-*` classes, and the root uses `z-index: 2147483647` to sit above host-page UI.
4. Fetches runtime config from `GET /api/widget/:businessId?key=...` and applies `--aiw-color` as a CSS custom property for theming.
5. Renders a launcher bubble → chat window (message list, input, booking button) or call form (name/email/phone/service) depending on business flags.
6. Keeps per-visitor state (`conversationId`, `contactId`, `visitorToken`) in memory and echoes it with every request so conversations resume seamlessly.
7. Auto-links URLs inside bot replies with `rel="noopener noreferrer"`.

Because it is plain DOM + `fetch`, there is nothing to install and no version skew with the host page's React/jQuery.

### 2.2 Config endpoint with layered checks (`app/api/widget/[businessId]/route.ts`)

`GET /api/widget/:id?key=...` returns only non-sensitive data:

```json
{
  "business": { "id": 1, "name": "...", "calendlyUrl": "..." },
  "widget":  { "primaryColor": "#0f766e", "callEnabled": true, "chatEnabled": true },
  "agent":   { "name": "Ava" }
}
```

Guards applied in order: id parse → active business lookup → **origin/key check** → rate limit (60/min per business+IP). Agent instructions, knowledge text, and provider IDs are never exposed here.

### 2.3 Origin + key allowlist (`lib/public-widget.ts`)

`isAllowedWidgetRequest()` implements the core trust decision:

1. `widgetKey` must equal the business's unique `publicKey` (cuid generated at creation).
2. In non-production, requests with no Origin or a localhost Origin pass — this keeps local development of host pages frictionless.
3. In production the request `Origin` must exactly match either:
   - the app's own `NEXT_PUBLIC_APP_URL` origin (dashboard demo page), or
   - the origin parsed from the business `website`, or
   - any origin listed in `allowedOrigins` (newline/comma separated, normalized through `new URL(...).origin`).

Malformed website values fail closed (`originFromUrl` returns null), so a typo cannot open the widget to every site.

### 2.4 CORS done right (`lib/cors.ts`)

Instead of `Access-Control-Allow-Origin: *`, responses reflect **only the verified request origin** and add `Vary: Origin` so caches never serve one site's CORS headers to another. Preflight `OPTIONS` handlers are exported from every public route.

## 3. Flow

```
Host page ──▶ widget.js ──▶ GET /api/widget/1?key=PUB
                                 │ business active? key matches? origin allowed?
                                 ▼ config (branding, flags)
Visitor opens chat ──▶ POST /api/chat {businessId, widgetKey, message, ...}
Visitor clicks call ──▶ POST /api/calls/start {...}
```

## 4. Key decisions & trade-offs

| Decision | Trade-off accepted |
|---|---|
| Static JS file, no bundler | Manual code discipline; but zero build step and cache-friendly |
| Origin header matching (not crypto tokens) | Origin is spoofable server-side, but browsers enforce it for real visitors; combined with the widget key it stops casual abuse |
| Localhost bypass in dev | Convenience during development; disabled by `NODE_ENV === "production"` |
| Config fetched at load time | Branding changes need a reload; acceptable vs. polling complexity |
| In-memory rate limit | Resets on redeploy, per-process; documented Redis upgrade path |

## 5. Outcome

A business can go from signup to a live AI assistant on their website by pasting one line:

```html
<script src="https://YOUR_DOMAIN.com/widget.js"
        data-business-id="1" data-widget-key="YOUR_WIDGET_KEY"></script>
```

…while the backend guarantees the widget only renders and answers where the business authorized it.
