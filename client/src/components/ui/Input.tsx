import type { InputHTMLAttributes } from "react";
import type { FormikProps } from "formik";
import { formControlInputMd } from "@/lib/formControlClasses";

type InputProps<T> = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  formik?: FormikProps<T>;
  error?: string | false;
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
  ...rest
}: InputProps<T>) => {
  const errors = formik?.errors as Record<string, string | false | undefined>;
  const touched = formik?.touched as Record<string, boolean | undefined>;
  const errorFromFormik = name ? errors?.[name] : undefined;
  const showErrorFromFormik = name ? Boolean(errorFromFormik) && (touched?.[name] || (formik?.submitCount ?? 0) > 0) : false;

  const error = errorProp ?? errorFromFormik;
  const showError = Boolean(errorProp) || showErrorFromFormik;

  return (
    <div className="grid gap-1.5">
      {label ? (
        <label htmlFor={name ?? ""} className="text-sm font-semibold text-slate-700">
          {label}
          {required ? <span className="text-red-600"> *</span> : null}
        </label>
      ) : null}
      <input
        id={name ?? ""}
        name={name ?? ""}
        value={value ?? (name && formik ? (formik.values as Record<string, string>)[name] ?? "" : "")}
        onChange={onChange ?? (formik?.handleChange as any)}
        onBlur={onBlur ?? (formik?.handleBlur as any)}
        required={required}
        className={`${formControlInputMd} ${showError ? "border-red-400 focus:border-red-500 focus:ring-red-500/10" : ""} ${className ?? ""}`}
        {...rest}
      />
      {showError ? <span className="text-xs font-medium text-red-600">{error}</span> : null}
    </div>
  );
};

export default Input;