# Case Study 5 — Lead Capture & Contact Resolution

**Feature:** Turn natural chat/call conversations into structured CRM leads without forms.
**Key files:** `lib/lead-capture.ts`, `lib/contacts.ts`, `app/api/chat/route.ts`, `app/api/contacts/capture/route.ts`

---

## 1. Problem

Forcing visitors through a "Name / Email / Phone" form before chatting kills conversion. But businesses only value the widget if it produces actionable leads. The system needed to harvest lead data **implicitly** from what visitors already type, deduplicate it across sessions, and keep every record tenant-scoped.

## 2. Solution

### 2.1 Regex-based field extraction (`extractLeadFields`)

On every chat message, the API concatenates **all prior user messages + the new one** and extracts:

| Field | Strategy |
|---|---|
| Email | Standard RFC-style regex, case-insensitive |
| Phone | `\+?\d[\d\s().-]{7,}\d` — tolerant of spaces, dashes, brackets |
| Name | `(my name is|i am|i'm) <words>` with a stop-word guard so "I am looking for pricing" doesn't become name="looking for" |
| Interested service | `(interested in|need|looking for) <up to 4 words>` with the same stop-word list |

No LLM call is spent on extraction — it is pure regex, adding ~0 latency and zero cost, and it runs *before* the answer is generated so results can be injected into the prompt.

### 2.2 Contact resolution ladder (`app/api/chat`)

Extraction feeds a careful identity-resolution sequence:

1. If the request carries a `contactId`, it is validated against **businessId + visitorToken** (`findBusinessContact`) — mismatched ids are rejected with 403.
2. Otherwise the visitor's stable `visitorToken` is looked up (`findContactByToken`).
3. Failing that, an exact match on extracted email → phone → name finds a returning visitor's existing record (dedupe).
4. Still nothing? A new Contact is created and linked to the conversation.

Each step back-fills `conversation.contactId` so history stays attached to one person. `updateWidgetContact` merges new fields into old records without overwriting known values with blanks.

### 2.3 Prompt feedback loop

The resolved contact becomes a summary line injected into Retell's dynamic variables:

```
Previously collected visitor details (do not ask for these again if listed):
Name: Ali, Phone: 0300..., Email: ali@...
```

So the agent's behavior improves with capture: once the regex grabs an email, the AI stops asking for it.

### 2.4 Explicit capture endpoint

`POST /api/contacts/capture` supports the widget's optional lead form (e.g., before a voice call), reusing the same create/update helpers and the same origin/key/rate-limit guards — one code path for implicit and explicit capture.

### 2.5 Pipeline-ready statuses

Contacts carry `status` (`NEW | QUALIFIED | WON | LOST`), `source` ("AI Widget"), and `interestedService`, letting business admins triage leads in the dashboard Contacts page and giving the dashboard metrics their counts.

## 3. Example

> Visitor: "hi, I'm Sara and I need teeth whitening"
> Message 1 → name=`Sara`, service=`teeth whitening` → Contact #42 created (NEW)
> Visitor: "my number is 0300 1234567"
> Message 2 → phone merged into Contact #42; agent told "already have details", asks booking instead

## 4. Key decisions & trade-offs

| Decision | Why |
|---|---|
| Regex over LLM extraction | Free, instant, deterministic; good enough for high-signal patterns ("my name is…") |
| Extraction over full user-message history | Visitors reveal details gradually; later messages still enrich the same contact |
| visitorToken on conversation + contact | Anonymous visitors keep continuity without cookies/localStorage dependencies |
| Fail-closed ownership checks | Cross-tenant or cross-visitor contact tampering returns 403 |
| Blank-safe merge updates | Re-submissions never erase previously captured fields |

## 5. Outcome

Businesses receive a continuously enriched lead list — names, phones, emails, service interests, statuses — assembled invisibly from conversation flow, with returning visitors recognized across visits and zero friction added for first-time ones.
