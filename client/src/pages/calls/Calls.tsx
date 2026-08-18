import { useFetch } from "../lib/hooks";

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
      <h1 className="page-title">Calls</h1>
      <p className="page-subtitle">Voice sessions created through the widget.</p>

      {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="table-shell mt-5">
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
            {!calls.length ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  No calls yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Calls;
