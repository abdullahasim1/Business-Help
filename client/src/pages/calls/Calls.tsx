import MetricCard from "../../components/MetricCard";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";
import StatusPill from "../../components/ui/StatusPill";
import TableShell from "../../components/ui/TableShell";
import { useFetch } from "../../lib/hooks";

type Call = {
  id: number;
  providerCallId: string | null;
  duration: number | null;
  transcript: string | null;
  summary: string | null;
  recordingUrl: string | null;
  createdAt: string;
  contact: { email: string | null; phone: string | null } | null;
};

const Calls = () => {
  const { data, error } = useFetch<Call[]>("/api/dashboard/calls");
  const calls = data ?? [];

  const completedCalls = calls.filter((c) => c.duration);
  const totalDuration = completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0);

  const stats = [
    { label: "Total calls", value: calls.length, icon: "⌕", iconBg: "bg-emerald-50", note: "All voice sessions" },
    { label: "Completed", value: completedCalls.length, icon: "✓", iconBg: "bg-blue-50", note: "Finished calls" },
    { label: "Total duration", value: `${Math.round(totalDuration / 60)} min`, icon: "⏱", iconBg: "bg-amber-50", note: "Time on calls" }
  ];

  const navigate = (path: string) => window.location.href = path;

  return (
    <section>
      <PageHeader
        title="Calls"
        subtitle="Voice sessions created through the widget."
        right={<StatusPill>{calls.length} total calls</StatusPill>}
      />

      {error ? <ErrorBanner message={error} className="mt-4" /> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} iconBg={stat.iconBg} note={stat.note} />
        ))}
      </div>

      <TableShell className="mt-6">
        {calls.length ? (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th className="w-56">Contact</th>
                  <th className="w-40">Call ID</th>
                  <th className="w-32">Duration</th>
                  <th className="min-w-[300px]">Call details</th>
                  <th className="w-48">Created</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/dashboard/calls/${call.id}`)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-extrabold text-emerald-600">📞</div>
                        <div className="font-medium text-slate-900 truncate">{call.contact?.email || call.contact?.phone || "Unknown"}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-slate-700">{call.providerCallId || "—"}</td>
                    <td className="px-5 py-4 text-center">
                      {call.duration ? (
                        <span className="font-medium text-slate-900">{call.duration}s</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">In progress</span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-md text-slate-500">
                      <p className="truncate">{call.summary || "Waiting for the completed call transcript."}</p>
                      {call.transcript ? (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium text-brand text-sm">View transcript</summary>
                          <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs text-slate-600">{call.transcript}</pre>
                        </details>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-sm whitespace-nowrap">{new Date(call.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No calls yet" description="Voice sessions will appear here when visitors use the widget call button." />
        )}
      </TableShell>
    </section>
  );
};

export default Calls;