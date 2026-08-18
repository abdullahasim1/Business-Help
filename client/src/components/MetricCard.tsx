import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  note?: string;
};

const MetricCard = ({ label, value, icon, note }: MetricCardProps) => {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
        <span>{label}</span>
        {icon ? <span className="text-slate-400">{icon}</span> : null}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      {note ? <div className="mt-2 text-xs text-slate-400">{note}</div> : null}
    </div>
  );
};

export default MetricCard;