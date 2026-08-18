import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  children: ReactNode;
};

const variants = {
  primary:
    "inline-flex items-center justify-center gap-1.5 rounded-[14px] bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-1.5 rounded-[14px] border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex items-center justify-center gap-1.5 rounded-[14px] bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
};

const Button = ({ variant = "primary", className, children, type, ...rest }: ButtonProps) => {
  return (
    <button type={type ?? "button"} className={`${variants[variant]} ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;