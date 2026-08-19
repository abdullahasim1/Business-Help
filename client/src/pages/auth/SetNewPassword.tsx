import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

const ChangePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().when("$isFirstTime", {
    is: false,
    then: () => Yup.string().min(8, "Password must be at least 8 characters").required("Current password is required"),
    otherwise: () => Yup.string().notRequired()
  }),
  newPassword: Yup.string().min(8, "Password must be at least 8 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password")
});

type ChangePasswordValues = { currentPassword?: string; newPassword: string; confirmPassword: string };

const SetNewPassword = ({ isFirstTime = false }: { isFirstTime?: boolean }) => {
  const navigate = useNavigate();

  const formik = useFormik<ChangePasswordValues>({
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: ChangePasswordSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus("");
      try {
        await api("/api/auth/change-password", {
          currentPassword: values.currentPassword || "",
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        });
        navigate(isFirstTime ? "/dashboard" : "/dashboard/settings");
      } catch (error) {
        setStatus((error as Error).message);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, isSubmitting, status } = formik;
  const hasAnyInput = !!(values.currentPassword || values.newPassword || values.confirmPassword);

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isFirstTime ? "Set Your Password" : "Change Password"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isFirstTime
              ? "Welcome! Please set a new password for your account."
              : "Enter your current password and choose a new one."}
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 flex w-full flex-col gap-4">
          {!isFirstTime && (
            <Input
              label="Current Password"
              type="password"
              name="currentPassword"
              placeholder="Enter current password"
              formik={formik}
              required
            />
          )}
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
            {isSubmitting ? "Saving..." : isFirstTime ? "Set Password & Continue" : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetNewPassword;