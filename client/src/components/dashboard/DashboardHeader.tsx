import type { ReactNode } from "react";

type DashboardHeaderProps = {
  label: string;
  title: string;
  subtitle: string;
  right?: ReactNode;
};

const DashboardHeader = ({ label, title, subtitle, right }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
};

export default DashboardHeader;