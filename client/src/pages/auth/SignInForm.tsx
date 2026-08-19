import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signInAction, type SignInValues } from "@/pages/auth/authApiCalls";
import { useAppDispatch } from "@/store/store";
import { setUser } from "@/store/slices/userSlice";

const SignInSchema = Yup.object().shape({
  email: Yup.string().email("Enter a valid email address").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required")
});

const SignInForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const formik = useFormik<SignInValues>({
    initialValues: { email: "", password: "" },
    validationSchema: SignInSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus("");
      try {
        const result = await signInAction(values);
        dispatch(setUser(result.user));
        navigate(result.redirect);
      } catch (error) {
        setStatus((error as Error).message);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { values, isSubmitting, status, handleSubmit, handleChange, handleBlur, errors, touched } = formik;
  const hasAnyInput = !!(values.email.trim() || values.password.trim());

  return (
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

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          autoComplete="current-password"
          required
          showPasswordToggle
        />
      </div>

      {status && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 animate-in fade-in slide-in-from-top-2">
          <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          {status}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting || !hasAnyInput} size="lg">
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};

export default SignInForm;