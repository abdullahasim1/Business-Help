import { Link } from "react-router-dom";
import MetricCard from "../../components/MetricCard";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";
import StatusPill from "../../components/ui/StatusPill";
import TableShell from "../../components/ui/TableShell";
import { useFetch } from "../../lib/hooks";
import { readMessages, type Conversation } from "../../lib/conversations";

const Conversations = () => {
  const { data, error } = useFetch<Conversation[]>("/api/dashboard/conversations");
  const conversations = data ?? [];

  const stats = [
    { label: "Total chats", value: conversations.length, icon: "◌", iconBg: "bg-violet-50", note: "All conversations" },
    { label: "This week", value: conversations.filter((c) => new Date(c.createdAt) > new Date(Date.now() - 7 * 86400000)).length, icon: "📅", iconBg: "bg-blue-50", note: "Last 7 days" },
    { label: "With contact info", value: conversations.filter((c) => c.contact?.email || c.contact?.name).length, icon: "♙", iconBg: "bg-emerald-50", note: "Identified visitors" }
  ];

  return (
    <section>
      <PageHeader
        label="Inbox"
        title="Conversations"
        subtitle="Read every chat between visitors and your AI assistant."
        right={<StatusPill>{conversations.length} conversations</StatusPill>}
      />

      {error ? <ErrorBanner message={error} className="mt-4" /> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} iconBg={stat.iconBg} note={stat.note} />
        ))}
      </div>

      <TableShell className="mt-6" title="All conversations" subtitle="Newest visitor conversations appear first.">
        {conversations.length ? (
          <div className="divide-y divide-slate-100">
            {conversations.map((conversation) => {
              const messages = readMessages(conversation.messagesJson);
              const last = messages.at(-1);
              const name = conversation.contact?.name || conversation.contact?.email || "Unknown visitor";
              return (
                <Link key={conversation.id} to={`/dashboard/conversations/${conversation.id}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-50 text-xs font-extrabold text-violet-600">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 group-hover:text-brand transition">{name}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{conversation.channel}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      <span className="font-medium text-slate-400">{last?.role === "assistant" ? "Assistant: " : "Visitor: "}</span>
                      {last?.content || "No messages yet"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-semibold text-slate-500">{messages.length} messages</div>
                    <div className="mt-1 text-xs text-slate-400">{new Date(conversation.createdAt).toLocaleString()}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No conversations yet" description="Visitor messages will appear here once your widget is live." />
        )}
      </TableShell>
    </section>
  );
};

export default Conversations;