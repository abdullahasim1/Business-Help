import { Link } from "react-router-dom";
import StatusPill from "@/components/ui/StatusPill";

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
      href: "/dashboard/agent",
      icon: "✦",
      iconBg: "bg-brand/10"
    },
    {
      ready: hasKnowledge,
      title: "Knowledge base is added",
      text: hasKnowledge ? "Your AI can answer from the saved business knowledge." : "Add your services, FAQs, hours, and policies.",
      href: "/dashboard/knowledge",
      icon: "▤",
      iconBg: "bg-amber-50"
    },
    {
      ready: hasWebsite,
      title: "Business profile is complete",
      text: hasWebsite ? "Your website is connected to this workspace." : "Add your business website in Settings.",
      href: "/dashboard/settings",
      icon: "🌐",
      iconBg: "bg-emerald-50"
    }
  ];

  const completed = checklist.filter((c) => c.ready).length;
  const total = checklist.length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Launch checklist</div>
            <StatusPill variant="blue">{completed}/{total} complete</StatusPill>
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Keep your assistant ready to help</h2>
        </div>
        <Link to="/dashboard/widget" className="btn-secondary px-3 py-2 text-xs">
          Open widget
        </Link>
      </div>
      <div className="mt-5 grid gap-3">
        {checklist.map((item, index) => (
          <Link
            key={item.title}
            to={item.href}
            className="group soft-card flex items-center gap-4 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <div className={`shrink-0 grid h-10 w-10 place-items-center rounded-lg text-base font-bold ${item.iconBg}`}>
              {item.ready ? (
                <span className="text-emerald-600">✓</span>
              ) : (
                <span className="text-amber-600">{item.icon}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 group-hover:text-brand transition">{item.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{item.text}</p>
            </div>
            <span className="shrink-0 text-lg text-slate-300 group-hover:text-slate-400 transition">›</span>
          </Link>
        ))}
      </div>
      <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand transition-all duration-500"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>
    </section>
  );
};

export default LaunchChecklist;