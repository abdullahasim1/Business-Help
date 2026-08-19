import { Link } from "react-router-dom";

const actions = [
  {
    title: "Add business knowledge",
    desc: "Teach your AI about services, FAQs, pricing, and policies.",
    href: "/dashboard/knowledge",
    icon: "▤",
    iconBg: "bg-amber-50"
  },
  {
    title: "Copy embed code",
    desc: "Get the script tag to place on your website.",
    href: "/dashboard/widget",
    icon: "▣",
    iconBg: "bg-blue-50"
  },
  {
    title: "Configure AI agent",
    desc: "Set name, tone, language, and instructions.",
    href: "/dashboard/agent",
    icon: "✦",
    iconBg: "bg-violet-50"
  },
  {
    title: "View conversations",
    desc: "Read what visitors are asking your assistant.",
    href: "/dashboard/conversations",
    icon: "◌",
    iconBg: "bg-emerald-50"
  }
];

const QuickActions = () => {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Quick actions</div>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Grow your lead flow</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Finish these essentials, then place the widget on your customer website.</p>
      <div className="mt-5 grid gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className="group soft-card flex items-center gap-3 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <div className={`shrink-0 grid h-10 w-10 place-items-center rounded-lg text-base font-bold ${action.iconBg}`}>
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 group-hover:text-brand transition">{action.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{action.desc}</p>
            </div>
            <span className="shrink-0 text-lg text-slate-300 group-hover:text-slate-400 transition">›</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default QuickActions;