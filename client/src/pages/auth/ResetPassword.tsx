import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import AuthLayout from "@/components/ui/AuthLayout";

const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password")
});

type ResetPasswordValues = { newPassword: string; confirmPassword: string };

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const formik = useFormik<ResetPasswordValues>({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: ResetPasswordSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      if (!token) {
        setStatus("Invalid or missing reset token");
        setSubmitting(false);
        return;
      }
      setStatus("");
      try {
        await api("/api/auth/reset-password", {
          token,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        });
        navigate("/login");
      } catch (error) {
        setStatus((error as Error).message);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, isSubmitting, status, handleSubmit, handleChange, handleBlur, errors, touched } = formik;
  const hasAnyInput = !!(values.newPassword || values.confirmPassword);

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="This password reset link is invalid or has expired."
        illustration={
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 text-6xl">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">Link Expired</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              The password reset link you used is no longer valid. Please request a new one.
            </p>
          </div>
        }
        footer={<a href="/login" className="text-brand hover:underline font-medium">Back to Sign In</a>}
      >
        <div className="text-center">
          <Button variant="secondary" className="w-full" onClick={() => navigate("/login")} size="lg">
            Go to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below."
      illustration={
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6 text-6xl">🔒</div>
          <h2 className="text-3xl font-bold text-white mb-4">Create New Password</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Your new password should be different from previous ones. Make it strong and memorable.
          </p>
        </div>
      }
      footer={<a href="/login" className="text-brand hover:underline font-medium">Back to Sign In</a>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700">New Password</label>
          <Input
            id="newPassword"
            type="password"
            name="newPassword"
            placeholder="Enter new password (min 8 characters)"
            value={values.newPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.newPassword && errors.newPassword}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword && errors.confirmPassword}
            autoComplete="new-password"
            required
          />
        </div>

        {status && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
            <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414 1.414L11.414 10l1.293-1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {status}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting || !hasAnyInput} size="lg">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              Resetting...
            </span>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;