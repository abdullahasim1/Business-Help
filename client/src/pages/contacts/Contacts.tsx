import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import MetricCard from "../../components/MetricCard";
import PageHeader from "../../components/ui/PageHeader";
import StatusPill from "../../components/ui/StatusPill";
import TableShell from "../../components/ui/TableShell";
import { useFetch } from "../../lib/hooks";

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

const Contacts = () => {
  const { data, error } = useFetch<Contact[]>("/api/dashboard/contacts");
  const contacts = data ?? [];
  const stats = [
    { label: "New leads", value: contacts.filter((c) => c.status === "NEW").length, note: "Needs follow-up" },
    { label: "With email", value: contacts.filter((c) => c.email).length, note: "Ready for campaigns" },
    { label: "With phone", value: contacts.filter((c) => c.phone).length, note: "Ready for call back" }
  ];

  return (
    <section>
      <PageHeader
        label="CRM"
        title="Contacts"
        subtitle="Every visitor lead captured through your chat and voice assistant."
        right={<StatusPill variant="gray">{contacts.length} total contacts</StatusPill>}
      />

      {error ? <ErrorBanner message={error} className="mt-4" /> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} note={stat.note} />
        ))}
      </div>

      <TableShell className="mt-6">
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
          <EmptyState title="No contacts yet" description="Contacts will appear when a visitor shares their details through your widget." />
        )}
      </TableShell>
    </section>
  );
};

export default Contacts;