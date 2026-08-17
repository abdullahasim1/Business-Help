export function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="panel p-5">
      <div className="text-sm font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}
