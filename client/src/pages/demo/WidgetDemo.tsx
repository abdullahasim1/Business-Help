import { useEffect, useState } from "react";
import { api } from "../lib/api";

type DemoBusiness = { id: number; name: string; publicKey: string } | null;

const WidgetDemo = () => {
  const [business, setBusiness] = useState<DemoBusiness>(null);

  useEffect(() => {
    api<DemoBusiness>("/api/widget-demo")
      .then(setBusiness)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fcfbff] text-[#172033]">
      <div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 px-5 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#10172b] text-xs font-extrabold text-white">AS</div>
            <span className="font-bold tracking-tight">ABC Solar</span>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Free consultation</span>
        </nav>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-[#10172b] px-7 py-14 text-white shadow-2xl shadow-indigo-950/20 md:px-14 md:py-20">
          <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-teal-100">Power your future</span>
            <h1 className="mt-6 text-4xl font-bold tracking-[-0.05em] md:text-6xl">Smart solar solutions for every roof.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">Explore tailored solar plans, clear savings estimates, and expert support from first question to installation.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#10172b]">Get a free estimate</button>
              <button className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white">How it works</button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 py-8 md:grid-cols-3">
          {[
            ["01", "Personalized plan", "A clear system design based on your home and goals."],
            ["02", "Simple savings", "Know your estimated costs and savings before you decide."],
            ["03", "Expert support", "Ask a question anytime through the assistant in the corner."]
          ].map(([number, title, text]) => (
            <article key={number} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-extrabold tracking-[0.14em] text-[#635bff]">{number}</span>
              <h2 className="mt-3 font-bold text-[#172033]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </article>
          ))}
        </section>
      </div>
      {business ? (
        <script src="/widget.js" data-business-id={business.id} data-widget-key={business.publicKey} async />
      ) : null}
    </main>
  );
}

export default WidgetDemo;
