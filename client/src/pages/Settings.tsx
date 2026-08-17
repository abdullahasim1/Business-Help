import { useFetch } from "../lib/hooks";

type SettingsData = {
  name: string;
  website: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export default function Settings() {
  const { data } = useFetch<SettingsData>("/api/dashboard/settings");

  return (
    <section>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Business profile details for this workspace.</p>
      <div className="panel mt-5 max-w-2xl divide-y divide-slate-100">
        <Row label="Business" value={data?.name ?? "-"} />
        <Row label="Website" value={data?.website ?? "-"} />
        <Row label="Status" value={data?.status ?? "-"} />
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 p-5 text-sm">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}