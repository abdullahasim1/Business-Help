import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";
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

  return (
    <section>
      <PageHeader title="Calls" subtitle="Voice sessions created through the widget." />

      {error ? <ErrorBanner message={error} className="mt-4" /> : null}

      <TableShell className="mt-5">
        {calls.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Call ID</th>
                <th>Duration</th>
                <th>Call details</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr key={call.id}>
                  <td className="font-medium text-slate-900">{call.contact?.email || call.contact?.phone || "-"}</td>
                  <td>{call.providerCallId || "-"}</td>
                  <td>{call.duration ? `${call.duration}s` : "-"}</td>
                  <td className="max-w-md text-slate-500">
                    <p>{call.summary || "Waiting for the completed call transcript."}</p>
                    {call.transcript ? (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium text-brand">View transcript</summary>
                        <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-xs text-slate-600">{call.transcript}</pre>
                      </details>
                    ) : null}
                  </td>
                  <td>{new Date(call.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No calls yet" description="Voice sessions will appear here when visitors use the widget call button." />
        )}
      </TableShell>
    </section>
  );
};

export default Calls;