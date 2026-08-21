# Case Study 4 — Knowledge Base (Text + PDF Ingestion & Retrieval)

**Feature:** Businesses teach their AI agent using inline text and uploaded PDFs; the engine feeds a bounded, clean context to Retell on every interaction.
**Key files:** `lib/knowledge.ts`, `app/api/knowledge/*`, `app/api/dashboard/knowledge/route.ts`

---

## 1. Problem

An agent is only as good as what it knows. Non-technical business admins needed to:

- paste or edit service/pricing/policy text directly,
- upload existing PDF brochures and menus without retyping,
- trust that whatever they save reaches the AI on the *very next* visitor message,
- without anyone tuning embeddings, vector DBs, or chunk sizes.

## 2. Solution

### 2.1 Two knowledge sources, one retrieval function

`retrieveKnowledge(businessId)` merges both sources deterministically:

```ts
const inline = business.knowledgeText || "";
const docText = docs.map(d => `[From document: ${d.fileName}]\n${d.content}`).join("\n\n");
return [inline, docText].filter(Boolean).join("\n\n").slice(0, 12_000);
```

- Inline text comes first (admin-curated = highest priority), then per-document sections labeled with their filename so the model can attribute answers.
- A hard **12,000-character budget** bounds token cost per chat turn / call setup regardless of how much the admin uploads.

### 2.2 Sanitization (`cleanText`)

All stored knowledge passes through one cleaner that strips `<script>`/`<style>` blocks, removes remaining HTML tags, collapses whitespace, and trims. This prevents prompt-injection payloads hidden in HTML-styled PDFs from arriving as executable-looking markup, and keeps prompts compact.

### 2.3 PDF ingestion (`app/api/knowledge/upload`)

- Uses `pdf-parse` server-side to extract raw text.
- Extracted text is cleaned and capped at **100,000 characters per document** before persisting to `KnowledgeDoc.content` (LONGTEXT) alongside `fileName`/`fileSize`.
- Listing endpoints return only metadata (`id`, `fileName`, `fileSize`, `createdAt`) — never the full content — keeping dashboard payloads light.
- Deletes are scoped: `deleteMany({ where: { id, businessId } })`, so one tenant can never remove another's document even by guessing ids.

### 2.4 Dashboard management

The Knowledge page lets admins edit inline text and upload/delete documents; every route sits behind `requireBusinessAdmin()` and writes only to `user.businessId`. Because retrieval happens at request time (not index time), edits are live immediately — no reindex job.

## 3. Flow

```
Admin saves text ──▶ Business.knowledgeText (cleaned)
Admin uploads PDF ──▶ pdf-parse ──▶ cleanText ──▶ slice 100k ──▶ KnowledgeDoc
                                        │
Visitor chats / calls ──▶ retrieveKnowledge(businessId)
                            └─ inline + labeled docs ──▶ slice 12k
                                  └─▶ retell_llm_dynamic_variables.business_knowledge
```

## 4. Key decisions & trade-offs

| Decision | Trade-off accepted |
|---|---|
| Whole-context injection instead of RAG/vector search | No infra (vector DB, embeddings); acceptable while total knowledge fits ~12k chars. Upgrade path: swap `retrieveKnowledge` internals for top-k retrieval without touching callers |
| Filename labels in context | Model can say "per our pricing PDF…" improving answer trust |
| 100k cap per doc + 12k per request | Predictable latency/cost; oversize uploads degrade gracefully rather than failing |
| Content stored in MySQL LONGTEXT | One backup story, no object storage to operate for MVP |

## 5. Outcome

A business owner pastes a few paragraphs or drops a PDF, clicks save, and the very next website visitor gets answers grounded in that material — with zero ML ops on the customer's side and a single clearly-bounded function to upgrade when scale demands real retrieval.
