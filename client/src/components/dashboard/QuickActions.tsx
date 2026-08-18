import { Link } from "react-router-dom";

const QuickActions = () => {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Quick actions</div>
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
  );
};

export default QuickActions;