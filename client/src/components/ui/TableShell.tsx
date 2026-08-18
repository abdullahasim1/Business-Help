import type { ReactNode } from "react";

type TableShellProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

const TableShell = ({ title, subtitle, actions, className, children }: TableShellProps) => {
  return (
    <div className={`table-shell ${className ?? ""}`}>
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default TableShell;