import { Link } from "react-router-dom";
import { useFetch } from "../lib/hooks";

export type Conversation = {
  id: number;
  createdAt: string;
  contact: { name: string | null; email: string | null; phone: string | null } | null;
  messagesJson: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string; createdAt: string };

export function readMessages(value: string): ChatMessage[] {
  try {
    const messages = JSON.parse(value) as ChatMessage[];
    return Array.isArray(messages) ? messages : [];
  } catch {
    return [];
  }
}

export default function Conversations() {
  const { data, error } = useFetch<Conversation[]>("/api/dashboard/conversations");
  const conversations = data ?? [];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-label">Inbox</div>
          <h1 className="page-title mt-1">Conversations</h1>
          <p className="page-subtitle">Read every chat between visitors and your AI assistant.</p>
        </div>
        <div className="status-pill">{conversations.length} conversations</div>
      </div>

      {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="table-shell mt-6">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">All conversations</h2>
            <p className="mt-1 text-xs text-slate-500">Newest visitor conversations appear first.</p>
          </div>
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand">Widget inbox</span>
        </div>
        {conversations.length ? (
          <div className="divide-y divide-slate-100">
            {conversations.map((conversation) => {
              const messages = readMessages(conversation.messagesJson);
              const last = messages.at(-1);
              const name = conversation.contact?.name || conversation.contact?.email || "Unknown visitor";
              return (
                <Link key={conversation.id} to={`/dashboard/conversations/${conversation.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-brand">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">Chat</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      <span className="font-medium text-slate-400">{last?.role === "assistant" ? "Assistant: " : "Visitor: "}</span>
                      {last?.content || "No messages yet"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-semibold text-slate-500">{messages.length} messages</div>
                    <div className="mt-1 text-xs text-slate-400">{new Date(conversation.createdAt).toLocaleDateString()}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-sm text-slate-500">No conversations yet. Visitor messages will appear here once your widget is live.</div>
        )}
      </div>
    </section>
  );
}
