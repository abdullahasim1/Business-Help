import SignInForm from "@/pages/auth/SignInForm";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/ui/AuthLayout";

const Login = () => {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your workspace to manage your AI assistant"
      illustration={
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6 text-6xl">🔐</div>
          <h2 className="text-3xl font-bold text-white mb-4">Secure Access</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Access your dashboard to manage conversations, monitor leads, and configure your AI assistant.
          </p>
        </div>
      }
      footer={<Link to="/auth/forgot-password" className="text-brand hover:underline font-medium">Forgot password?</Link>}
    >
      <SignInForm />
    </AuthLayout>
  );
};

export default Login;