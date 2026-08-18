import { Link } from "react-router-dom";

type LaunchChecklistProps = {
  agentName: string;
  agentStatus: "ACTIVE" | "INACTIVE";
  hasKnowledge: boolean;
  hasWebsite: boolean;
};

const LaunchChecklist = ({ agentName, agentStatus, hasKnowledge, hasWebsite }: LaunchChecklistProps) => {
  const checklist = [
    {
      ready: agentStatus === "ACTIVE",
      title: "AI agent is active",
      text: agentStatus === "ACTIVE" ? `${agentName} is ready for visitor questions.` : "Activate the AI agent before publishing the widget.",
      href: "/dashboard/agent"
    },
    {
      ready: hasKnowledge,
      title: "Knowledge base is added",
      text: hasKnowledge ? "Your AI can answer from the saved business knowledge." : "Add your services, FAQs, hours, and policies.",
      href: "/dashboard/knowledge"
    },
    {
      ready: hasWebsite,
      title: "Business profile is complete",
      text: hasWebsite ? "Your website is connected to this workspace." : "Add your business website in Settings.",
      href: "/dashboard/settings"
    }
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Launch checklist</div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Keep your assistant ready to help</h2>
        </div>
        <Link to="/dashboard/widget" className="btn-secondary px-3 py-2 text-xs">
          Open widget
        </Link>
      </div>
      <div className="mt-5 grid gap-3">
        {checklist.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="soft-card flex items-center gap-3 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
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
  );
};

export default LaunchChecklist;