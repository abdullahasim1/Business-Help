import { Link } from "react-router-dom";
import PageContainer from "@/components/ui/PageContainer";
import PageHeader from "@/components/ui/PageHeader";
import ErrorBanner from "@/components/ui/ErrorBanner";
import StatusPill from "@/components/ui/StatusPill";
import StatsCards from "@/components/dashboard/StatsCards";
import LaunchChecklist from "@/components/dashboard/LaunchChecklist";
import QuickActions from "@/components/dashboard/QuickActions";
import { useFetch } from "../../lib/hooks";
import { readMessages } from "../../lib/conversations";

type Contact = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  interestedService: string | null;
  status: "NEW" | "QUALIFIED" | "WON" | "LOST";
  source: string;
  createdAt: string;
};

type Conversation = {
  id: number;
  channel: "WIDGET" | "DASHBOARD";
  contact: { name: string | null; email: string | null } | null;
  messagesJson: string;
  createdAt: string;
};

type DashboardData = {
  contacts: number;
  conversations: number;
  calls: number;
  business: {
    agentName: string;
    agentStatus: "ACTIVE" | "INACTIVE";
    knowledgeText: string | null;
    website: string | null;
  };
  recentContacts: Contact[];
  recentConversations: Conversation[];
};

const statusStyle: Record<Contact["status"], string> = {
  NEW: "bg-blue-50 text-blue-700",
  QUALIFIED: "bg-amber-50 text-amber-700",
  WON: "bg-emerald-50 text-emerald-700",
  LOST: "bg-slate-100 text-slate-600"
};

type ActivityItem =
  | { type: "contact"; data: Contact }
  | { type: "conversation"; data: Conversation };

const Dashboard = () => {
  const { data, error } = useFetch<DashboardData>("/api/dashboard");
  const business = data?.business;

  const recentContacts = data?.recentContacts ?? [];
  const recentConversations = data?.recentConversations ?? [];

  // Combine and sort by date, take latest 5
  const activities: ActivityItem[] = [
    ...recentContacts.map((c) => ({ type: "contact" as const, data: c })),
    ...recentConversations.map((c) => ({ type: "conversation" as const, data: c }))
  ]
    .sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime())
    .slice(0, 5);

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-[1172px]">
        <PageHeader
          label="Overview"
          title="Dashboard"
          subtitle="Track visitor activity and keep your AI assistant ready to convert leads."
          right={
            <StatusPill dot>
              Workspace online
            </StatusPill>
          }
        />

        {error ? <ErrorBanner message={error} className="mt-4" /> : null}

        <StatsCards
          contacts={data?.contacts ?? 0}
          conversations={data?.conversations ?? 0}
          calls={data?.calls ?? 0}
          agentName={business?.agentName ?? ""}
          agentStatus={business?.agentStatus ?? "INACTIVE"}
          hasKnowledge={Boolean(business?.knowledgeText)}
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Recent activity</div>
                <h2 className="mt-1 text-lg font-bold text-slate-900">Latest leads & chats</h2>
              </div>
              <div className="flex gap-2">
                <Link to="/dashboard/contacts" className="btn-secondary text-xs px-3 py-1.5">All contacts</Link>
                <Link to="/dashboard/conversations" className="btn-secondary text-xs px-3 py-1.5">All chats</Link>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {activities.length > 0 ? (
                activities.map((activity) => {
                  if (activity.type === "contact") {
                    const contact = activity.data;
                    return (
                      <Link
                        key={`contact-${contact.id}`}
                        to="/dashboard/contacts"
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
                      >
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-brand">
                          {(contact.name || contact.email || contact.phone || "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-900 truncate">{contact.name || contact.email || contact.phone || "Unknown visitor"}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusStyle[contact.status]}`}>{contact.status}</span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {contact.interestedService || "New lead captured"} · {new Date(contact.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] text-slate-400">New lead</span>
                      </Link>
                    );
                  }
                  const conversation = activity.data;
                  const messages = readMessages(conversation.messagesJson);
                  const last = messages.at(-1);
                  const name = conversation.contact?.name || conversation.contact?.email || "Unknown visitor";
                  return (
                    <Link
                      key={`conv-${conversation.id}`}
                      to={`/dashboard/conversations/${conversation.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50 text-xs font-extrabold text-violet-600">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-900 truncate">{name}</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">Chat</span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          <span className="font-medium text-slate-400">{last?.role === "assistant" ? "Assistant: " : "Visitor: "}</span>
                          {last?.content || "No messages yet"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] font-medium text-slate-500">{messages.length} msgs</div>
                        <div className="text-[10px] text-slate-400">{new Date(conversation.createdAt).toLocaleString()}</div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="mx-auto h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xl">💬</div>
                  <p className="mt-2 text-sm font-medium text-slate-900">No activity yet</p>
                  <p className="text-xs text-slate-500">Visitor leads and chats will appear here once your widget is live.</p>
                </div>
              )}
            </div>
          </section>

          <div className="space-y-5">
            <LaunchChecklist
              agentName={business?.agentName ?? ""}
              agentStatus={business?.agentStatus ?? "INACTIVE"}
              hasKnowledge={Boolean(business?.knowledgeText)}
              hasWebsite={Boolean(business?.website)}
            />
            <QuickActions />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;