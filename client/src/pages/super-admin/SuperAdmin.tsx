import ErrorBanner from "../../components/ui/ErrorBanner";
import MetricCard from "../../components/MetricCard";
import PageHeader from "../../components/ui/PageHeader";
import { useFetch } from "../../lib/hooks";

type OverviewData = { businesses: number; contacts: number; conversations: number; calls: number };

const SuperAdmin = () => {
  const { data, error } = useFetch<OverviewData>("/api/super-admin/overview");

  return (
    <section>
      <PageHeader title="Super Admin" subtitle="Platform-wide snapshot across businesses, leads, chats, and calls." />
      {error ? <ErrorBanner message={error} className="mt-4" /> : null}
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Businesses" value={data?.businesses ?? "—"} />
        <MetricCard label="Total Contacts" value={data?.contacts ?? "—"} />
        <MetricCard label="Total Conversations" value={data?.conversations ?? "—"} />
        <MetricCard label="Total Calls" value={data?.calls ?? "—"} />
      </div>
    </section>
  );
};

export default SuperAdmin;