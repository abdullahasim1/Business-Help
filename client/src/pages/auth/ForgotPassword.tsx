import * as Yup from "yup";
import { useFormik } from "formik";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import AuthLayout from "@/components/ui/AuthLayout";

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

  const { values, isSubmitting, status, handleSubmit, handleChange, handleBlur, errors, touched } = formik;
  const hasAnyInput = !!values.email.trim();

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you a reset link."
      illustration={
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6 text-6xl">🔑</div>
          <h2 className="text-3xl font-bold text-white mb-4">Reset Your Password</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            No worries! Just enter your email address and we'll send you a secure link to create a new password.
          </p>
        </div>
      }
      footer={<a href="/login" className="text-brand hover:underline font-medium">Back to Sign In</a>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email}
            autoComplete="email"
            required
          />
        </div>

        {status === "success" ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 animate-in fade-in slide-in-from-top-2">
            <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            If the email exists, a reset link has been sent.
          </div>
        ) : status ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
            <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {status}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting || !hasAnyInput} size="lg">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              Sending...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;