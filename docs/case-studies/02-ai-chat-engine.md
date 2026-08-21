# Case Study 2 — AI Chat Engine (Retell Integration)

**Feature:** Conversational chat answers for website visitors, driven by per-business AI agents.
**Key files:** `app/api/chat/route.ts`, `lib/llm.ts`, `lib/retell-setup.ts`, `lib/knowledge.ts`, `lib/lead-capture.ts`

---

## 1. Problem

Each business needs its own chat agent that:

- knows *their* services, pricing, and policies (knowledge),
- speaks in *their* tone/language with *their* agent name,
- never invents booking links,
- remembers the visitor across messages,
- and quietly turns small talk into captured leads.

Doing this with raw LLM APIs would mean building prompt management, session memory, and provider failover from scratch. The MVP leans on **Retell chat agents** and keeps a local fallback so development never blocks on an API key.

## 2. Solution

### 2.1 Request pipeline (`POST /api/chat`)

The route is a single orchestrated transaction of nine steps:

1. **Validate** — `businessId`, optional `conversationId`/`contactId`/`visitorToken`, required `widgetKey`, message capped at 4,000 chars (`lib/validation.ts`).
2. **Tenant gate** — business must exist, be `ACTIVE`, have `agentStatus === ACTIVE` and `chatEnabled`.
3. **Widget trust** — same origin/key allowlist as the config endpoint.
4. **Rate limit** — 20 messages/min per business+IP.
5. **Conversation resolution** — find by id **scoped to businessId + visitorToken** (prevents cross-tenant/cross-visitor hijacking), else create one with a random 24-byte token.
6. **Lead extraction & stitching** — run regex extraction over all prior user messages plus the new one; match/create a Contact and link it to the conversation (see Case Study 5).
7. **Context assembly** — knowledge retrieval + contact summary + business settings.
8. **Answer generation** — Retell if possible, else local keyword fallback.
9. **Persist** — append user+assistant messages to `messagesJson`, store `providerChatId`.

### 2.2 Retell chat sessions (`lib/llm.ts`)

- `startRetellChat()` calls `/create-chat` once per conversation, injecting **dynamic variables**: `system_instructions`, `contact_summary`, `business_knowledge`, `agent_name`, `language`, `tone`, `booking_url`. The Retell-side prompt references them as `{{...}}`, so one agent template serves every business.
- `sendRetellChatMessage()` calls `/create-chat-completion` per visitor message and picks the first `role: "agent"` reply; a safe default answer is returned when none exists.
- The returned `chat_id` is persisted on the Conversation row, so subsequent messages reuse the session instead of re-creating it (cheaper, and preserves in-session memory).

### 2.3 Self-provisioning agents (`lib/retell-setup.ts`)

If the business has no `chatAgentId`, `ensureBusinessChatAgent()` creates one on first use:

- A single shared Retell LLM (`gpt-4.1`) is created once globally, its id cached in `AppSetting` (`retellDefaultLlmId`) and in-process. Its prompt encodes house rules: answer only what's asked, stay concise, share `{{booking_url}}` only when asked, never invent links.
- A per-business chat agent is then created against that LLM, named after the business, with 30-minute silence auto-close.
- The new `agent_id` is written back to the Business row — provisioning happens exactly once per tenant.

### 2.4 Graceful degradation

- If Retell errors mid-chat, `generateRetellResponse()` catches, logs, and returns a polite "try again" message — the HTTP call still succeeds so the widget UI stays stable.
- If no API key / agent can be created at all, `generateLocalKnowledgeResponse()` scores knowledge sentences against message keywords (terms > 3 chars) and returns the top matches prefixed with the agent name. Development and demos keep working offline.

## 3. Sequence

```
Visitor msg ─▶ /api/chat
                ├─ guards (active, origin, rate)
                ├─ conversation resolve/create (token-scoped)
                ├─ lead extract → contact upsert/link
                ├─ retrieveKnowledge(businessId)  [inline + docs ≤ 12k chars]
                ├─ ensureBusinessChatAgent? ─▶ Retell /create-chat-agent (once)
                ├─ Retell /create-chat (once per convo, dynamic vars)
                ├─ Retell /create-chat-completion (per msg)
                └─ save messagesJson + providerChatId ─▶ answer
```

## 4. Key decisions & trade-offs

| Decision | Why |
|---|---|
| Provider sessions stored on the row | Resuming a chat costs zero extra lookups; no Redis session store |
| Dynamic variables over per-business prompts | One LLM template to govern; business data stays out of provider prompt storage |
| Knowledge re-sent every session | Always-fresh answers after dashboard edits; bounded to 12k chars to control token spend |
| Regex lead extraction before answering | The contact summary reaches the model in the same turn ("do not ask again if listed") |
| Local fallback engine | Zero-dependency dev mode; also acts as circuit breaker when Retell is down |

## 5. Outcome

Visitors get brand-correct, knowledge-grounded answers with continuity across page loads, businesses get leads captured invisibly from natural conversation, and the platform provisions AI agents lazily — no manual provider setup per customer.
