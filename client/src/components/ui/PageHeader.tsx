import type { ReactNode } from "react";

type PageHeaderProps = {
  label?: string;
  title: string;
  subtitle: string;
  right?: ReactNode;
};

const PageHeader = ({ label, title, subtitle, right }: PageHeaderProps) => {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {label ? <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</div> : null}
        <h1 className="page-title mt-1">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
};

export default PageHeader;