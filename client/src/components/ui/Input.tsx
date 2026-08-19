import type { InputHTMLAttributes } from "react";
import type { FormikProps } from "formik";
import { useState } from "react";
import { formControlInputMd } from "@/lib/formControlClasses";

type InputProps<T> = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  formik?: FormikProps<T>;
  error?: string | false;
  showPasswordToggle?: boolean;
};

const Input = <T,>({
  label,
  name,
  formik,
  error: errorProp,
  className,
  required,
  value,
  onChange,
  onBlur,
  showPasswordToggle = false,
  type: _ignoredType,
  ...rest
}: InputProps<T>) => {
  const errors = formik?.errors as Record<string, string | false | undefined>;
  const touched = formik?.touched as Record<string, boolean | undefined>;
  const errorFromFormik = name ? errors?.[name] : undefined;
  const showErrorFromFormik = name ? Boolean(errorFromFormik) && (touched?.[name] || (formik?.submitCount ?? 0) > 0) : false;

  const error = errorProp ?? errorFromFormik;
  const showError = Boolean(errorProp) || showErrorFromFormik;

  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : "text";

  const handleToggle = () => setShowPassword((prev) => !prev);

  return (
    <div className="grid gap-1.5">
      {label ? (
        <label htmlFor={name ?? ""} className="text-sm font-semibold text-slate-700">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={name ?? ""}
          name={name ?? ""}
          type={inputType ?? "text"}
          value={value ?? (name && formik ? (formik.values as Record<string, string>)[name] ?? "" : "")}
          onChange={onChange ?? (formik?.handleChange as any)}
          onBlur={onBlur ?? (formik?.handleBlur as any)}
          required={required}
          className={`${formControlInputMd} ${showError ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""} ${showPasswordToggle ? "pr-10" : ""} ${className ?? ""}`}
          {...rest}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={handleToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        )}
      </div>
      {showError ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </div>
  );
};

export default Input;