import SignInForm from "@/pages/auth/SignInForm";

const Login = () => {
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
        <p className="mt-1 text-sm text-slate-500">Enter your workspace credentials.</p>
        <SignInForm />
      </div>
    </div>
  );
};

export default Login;