import { Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { Field } from "@/components/Field";
import { api, type SessionUser } from "@/lib/api";
import { loginSchema } from "@/lib/validations";
import { useAppDispatch } from "@/store/store";
import { setUser } from "@/store/slices/userSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
        <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your workspace credentials.</p>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setStatus, setSubmitting }) => {
            setStatus("");
            try {
              await api("/api/auth/login", values);
              const { user } = await api<{ user: SessionUser }>("/api/auth/me");
              dispatch(setUser(user));
              navigate(user.role === "SUPER_ADMIN" ? "/super-admin" : "/dashboard");
            } catch (error) {
              setStatus((error as Error).message);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, status }) => (
            <Form className="mt-6 grid gap-4">
              <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@business.com" />
              <Field label="Password" name="password" type="password" autoComplete="current-password" placeholder="Your password" />
              {status ? <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status}</div> : null}
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
