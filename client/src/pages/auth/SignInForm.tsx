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

  const { values, isSubmitting, status } = formik;
  const hasAnyInput = !!(values.email.trim() || values.password.trim());

  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign In</h1>
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
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          formik={formik}
          required
        />
        {status ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status}</div> : null}
        <Button type="submit" disabled={isSubmitting || !hasAnyInput}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
        <a className="text-center text-sm font-semibold text-brand hover:underline block" href="/auth/forgot-password">
          Forgot password?
        </a>
      </form>
    </>
  );
};

export default SignInForm;