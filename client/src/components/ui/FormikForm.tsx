import { Form, Formik, type FormikProps, type FormikValues } from "formik";
import type { AnySchema } from "yup";
import type { ReactNode } from "react";
import ErrorBanner from "./ErrorBanner";

type FormikFormProps<T extends FormikValues> = {
  initialValues: T;
  schema?: AnySchema;
  onSubmit: (values: T, helpers: { resetForm: () => void }) => Promise<void>;
  submitLabel: string;
  submitLoadingLabel?: string;
  submitClassName?: string;
  className?: string;
  children: ReactNode | ((formik: FormikProps<T>) => ReactNode);
};

const FormikForm = <T extends FormikValues,>({
  initialValues,
  schema,
  onSubmit,
  submitLabel,
  submitLoadingLabel = "Saving...",
  submitClassName,
  className,
  children
}: FormikFormProps<T>) => {
  return (
    <Formik<T>
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting, setStatus, resetForm }) => {
        setStatus("");
        try {
          await onSubmit(values, { resetForm });
        } catch (error) {
          setStatus((error as Error).message);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <Form className={className}>
          {typeof children === "function" ? children(formik as FormikProps<T>) : children}
          {formik.status ? <ErrorBanner message={formik.status} /> : null}
          <button type="submit" className={`btn-primary w-fit ${submitClassName ?? ""}`} disabled={formik.isSubmitting}>
            {formik.isSubmitting ? submitLoadingLabel : submitLabel}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default FormikForm;