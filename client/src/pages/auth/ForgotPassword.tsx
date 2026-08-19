import * as Yup from "yup";
import { useFormik } from "formik";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Enter a valid email address").required("Email is required")
});

const ForgotPassword = () => {
  const formik = useFormik<{ email: string }>({
    initialValues: { email: "" },
    validationSchema: ForgotPasswordSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus("");
      try {
        await api("/api/auth/forgot-password", { email: values.email });
        setStatus("success");
      } catch (error) {
        setStatus((error as Error).message);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, isSubmitting, status } = formik;
  const hasAnyInput = !!values.email.trim();

  return (
    <div className="auth-shell grid place-items-center p-4">
      <div className="auth-card w-full max-w-sm p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-sm font-extrabold text-white">AI</div>
          <div>
            <div className="font-bold tracking-tight text-slate-900">AI Widget</div>
            <div className="text-xs font-semibold text-slate-400">Chat + call assistant</div>
          </div>
        </div>
        <div className="text-center mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Forgot Password?</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 flex w-full flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            formik={formik}
            required
          />
          {status === "success" ? (
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              If the email exists, a reset link has been sent.
            </div>
          ) : status ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status}</div>
          ) : null}
          <Button type="submit" disabled={isSubmitting || !hasAnyInput}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm font-semibold text-brand hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;