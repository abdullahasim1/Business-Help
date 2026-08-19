import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  note?: string;
};

const MetricCard = ({ label, value, icon, iconBg = "bg-brand/10", trend, note }: MetricCardProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-500 truncate">{label}</p>
          <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
              <span className={trend.value >= 0 ? "text-emerald-600" : "text-red-600"}>
                {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}%
              </span>
              <span className="text-slate-400">{trend.label}</span>
            </div>
          )}
          {note && <p className="mt-2 text-xs text-slate-400">{note}</p>}
        </div>
        {icon && (
          <div className={`flex shrink-0 h-12 w-12 items-center justify-center rounded-xl ${iconBg} text-brand`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;