import { MetricCard } from "../components/MetricCard";
import { useFetch } from "../lib/hooks";

type OverviewData = { businesses: number; contacts: number; conversations: number; calls: number };

export default function SuperAdmin() {
  const { data, error } = useFetch<OverviewData>("/api/super-admin/overview");

  return (
    <section>
      <h1 className="page-title">Super Admin</h1>
      <p className="page-subtitle">Platform-wide snapshot across businesses, leads, chats, and calls.</p>
      {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Businesses" value={data?.businesses ?? "—"} />
        <MetricCard label="Total Contacts" value={data?.contacts ?? "—"} />
        <MetricCard label="Total Conversations" value={data?.conversations ?? "—"} />
        <MetricCard label="Total Calls" value={data?.calls ?? "—"} />
      </div>
    </section>
  );
}