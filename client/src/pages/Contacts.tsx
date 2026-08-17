import { useFetch } from "../lib/hooks";

type Contact = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  interestedService: string | null;
  status: "NEW" | "QUALIFIED" | "WON" | "LOST";
  source: string;
  createdAt: string;
  _count: { conversations: number; calls: number };
};

const statusStyle: Record<Contact["status"], string> = {
  NEW: "bg-blue-50 text-blue-700",
  QUALIFIED: "bg-amber-50 text-amber-700",
  WON: "bg-emerald-50 text-emerald-700",
  LOST: "bg-slate-100 text-slate-600"
};

export default function Contacts() {
  const { data, error } = useFetch<Contact[]>("/api/dashboard/contacts");
  const contacts = data ?? [];
  const stats = [
    ["New leads", contacts.filter((c) => c.status === "NEW").length, "Needs follow-up"],
    ["With email", contacts.filter((c) => c.email).length, "Ready for campaigns"],
    ["With phone", contacts.filter((c) => c.phone).length, "Ready for call back"]
  ];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-label">CRM</div>
          <h1 className="page-title mt-1">Contacts</h1>
          <p className="page-subtitle">Every visitor lead captured through your chat and voice assistant.</p>
        </div>
        <div className="status-pill">{contacts.length} total contacts</div>
      </div>

      {error ? <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map(([label, value, note]) => (
          <div key={label as string} className="panel p-5">
            <div className="text-sm font-semibold text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
            <div className="mt-2 text-xs text-slate-400">{note}</div>
          </div>
        ))}
      </div>

      <div className="table-shell mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">All contacts</h2>
            <p className="mt-1 text-xs text-slate-500">Review contact details, interest, and activity in one place.</p>
          </div>
        </div>
        {contacts.length ? (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[760px]">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Interested in</th>
                  <th>Status</th>
                  <th>Activity</th>
                  <th>Source</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <div className="font-semibold text-slate-900">{contact.name || contact.email || contact.phone || "Unknown visitor"}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{contact.email || contact.phone || "No contact details"}</div>
                    </td>
                    <td className="font-medium text-slate-700">{contact.interestedService || "—"}</td>
                    <td>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[contact.status]}`}>{contact.status}</span>
                    </td>
                    <td className="text-slate-600">{contact._count.conversations} chats · {contact._count.calls} calls</td>
                    <td>
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{contact.source}</span>
                    </td>
                    <td className="text-slate-500">{new Date(contact.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid place-items-center px-6 py-16 text-center">
            <h3 className="font-bold text-slate-900">No contacts yet</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Contacts will appear when a visitor shares their details through your widget.</p>
          </div>
        )}
      </div>
    </section>
  );
}
