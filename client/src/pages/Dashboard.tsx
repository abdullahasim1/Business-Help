import { Link } from "react-router-dom";
import { MetricCard } from "../components/MetricCard";
import { useFetch } from "../lib/hooks";

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
};

export default function Dashboard() {
  const { data, error } = useFetch<DashboardData>("/api/dashboard");
  const business = data?.business;
  const checklist = [
    { ready: business?.agentStatus === "ACTIVE", title: "AI agent is active", text: business?.agentStatus === "ACTIVE" ? `${business.agentName} is ready for visitor questions.` : "Activate the AI agent before publishing the widget.", href: "/dashboard/agent" },
    { ready: Boolean(business?.knowledgeText), title: "Knowledge base is added", text: business?.knowledgeText ? "Your AI can answer from the saved business knowledge." : "Add your services, FAQs, hours, and policies.", href: "/dashboard/knowledge" },
    { ready: Boolean(business?.website), title: "Business profile is complete", text: business?.website ? "Your website is connected to this workspace." : "Add your business website in Settings.", href: "/dashboard/settings" }
  ];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-label">Overview</div>
          <h1 className="page-title mt-1">Dashboard</h1>
          <p className="page-subtitle">Track visitor activity and keep your AI assistant ready to convert leads.</p>
        </div>
        <div className="status-pill">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Workspace online
        </div>
      </div>

      {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Contacts" value={data?.contacts ?? "—"} />
        <MetricCard label="Conversations" value={data?.conversations ?? "—"} />
        <MetricCard label="Calls" value={data?.calls ?? "—"} />
        <MetricCard label="Active AI Agent" value={business?.agentStatus === "ACTIVE" ? business.agentName : "None"} />
        <MetricCard label="Knowledge" value={business?.knowledgeText ? "Ready" : "Empty"} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
        <section className="panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="section-label">Launch checklist</div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Keep your assistant ready to help</h2>
            </div>
            <Link to="/dashboard/widget" className="btn-secondary px-3 py-2 text-xs">
              Open widget
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {checklist.map((item) => (
              <Link key={item.title} to={item.href} className="soft-card flex items-center gap-3 p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${item.ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {item.ready ? "✓" : "!"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900">{item.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{item.text}</span>
                </span>
                <span className="text-lg text-slate-400">›</span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="panel p-6">
          <div className="section-label">Quick actions</div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Grow your lead flow</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Finish these essentials, then place the widget on your customer website.</p>
          <div className="mt-5 grid gap-2">
            <Link to="/dashboard/knowledge" className="soft-card px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-brand">
              Add business knowledge
            </Link>
            <Link to="/dashboard/widget" className="soft-card px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-brand">
              Copy embed code
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
