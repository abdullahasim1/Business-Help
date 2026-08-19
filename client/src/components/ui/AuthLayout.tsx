import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  illustration?: ReactNode;
  footer?: ReactNode;
};

export default function AuthLayout({ children, title, subtitle, illustration, footer }: AuthLayoutProps) {
  return (
    <div className="auth-shell min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-blue-600 to-violet-700" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative h-full flex flex-col items-center justify-center p-12">
          <div className="mb-8">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm text-2xl font-extrabold text-white">AI</div>
          </div>
          {illustration || (
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 text-6xl">💬</div>
              <h2 className="text-3xl font-bold text-white mb-4">AI Chat + Call Widget</h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Engage visitors instantly with AI-powered chat and voice calls. Capture leads, answer questions, and grow your business 24/7.
              </p>
            </div>
          )}
          <div className="mt-12 flex gap-4 text-white/60 text-sm">
            <span className="flex items-center gap-1">🔒 Secure & Private</span>
            <span className="flex items-center gap-1">⚡ Real-time</span>
            <span className="flex items-center gap-1">🌍 Multi-language</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-grid h-12 w-12 place-items-center rounded-xl bg-brand text-xl font-extrabold text-white mb-4">AI</div>
            <h1 className="text-2xl font-bold text-slate-900">AI Widget</h1>
            <p className="text-sm text-slate-500 mt-1">Chat + call assistant</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
          </div>

          <div className="auth-card rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/30 p-8">
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-sm text-slate-500">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}