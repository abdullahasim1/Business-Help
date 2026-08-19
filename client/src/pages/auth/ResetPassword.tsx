import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

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

  const { values, isSubmitting, status } = formik;
  const hasAnyInput = !!(values.newPassword || values.confirmPassword);

  if (!token) {
    return (
      <div className="auth-shell grid place-items-center p-4">
        <div className="auth-card w-full max-w-sm p-8 text-center">
          <div className="text-red-600 text-lg font-semibold">Invalid or missing reset token</div>
          <a href="/login" className="mt-4 block text-sm font-semibold text-brand hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your new password below.</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 flex w-full flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            name="newPassword"
            placeholder="Enter new password (min 8 characters)"
            formik={formik}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            formik={formik}
            required
          />
          {status ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status}</div> : null}
          <Button type="submit" disabled={isSubmitting || !hasAnyInput}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;