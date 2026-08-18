import type { ReactNode } from "react";

type StatusPillProps = {
  children: ReactNode;
  variant?: "green" | "gray" | "blue";
  dot?: boolean;
};

const variants = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  gray: "border-slate-200 bg-slate-100 text-slate-600",
  blue: "border-blue-200 bg-blue-50 text-blue-700"
};

const dots = {
  green: "bg-emerald-500",
  gray: "bg-slate-400",
  blue: "bg-blue-500"
};

const StatusPill = ({ children, variant = "green", dot }: StatusPillProps) => {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${variants[variant]}`}>
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`} /> : null}
      {children}
    </span>
  );
};

export default StatusPill;