import { Field as FormikField, useField } from "formik";
import { formControlInputMd } from "@/lib/formControlClasses";

type FieldProps = {
  label: string;
  name: string;
  hint?: string;
  inputClassName?: string;
  [key: string]: unknown;
};

const Field = ({ label, name, hint, inputClassName, ...rest }: FieldProps) => {
  const [, meta] = useField(name);
  const isCheckbox = rest.type === "checkbox";

  return (
    <label className={isCheckbox ? "flex items-center gap-2 text-sm font-semibold text-slate-700" : "grid gap-1.5 text-sm font-semibold text-slate-700"}>
      {isCheckbox ? (
        <>
          <FormikField name={name} className="h-4 w-4 rounded accent-brand" {...rest} />
          <span>{label}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <FormikField name={name} className={`${formControlInputMd} ${inputClassName ?? ""}`} {...rest} />
        </>
      )}
      {hint && !isCheckbox ? <span className="text-xs font-normal text-slate-400">{hint}</span> : null}
      {meta.touched && meta.error ? <span className="text-xs font-medium text-red-600">{meta.error}</span> : null}
    </label>
  );
};

export default Field;