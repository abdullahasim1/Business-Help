import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import MetricCard from "../../components/MetricCard";
import PageHeader from "../../components/ui/PageHeader";
import StatusPill from "../../components/ui/StatusPill";
import TableShell from "../../components/ui/TableShell";
import { useFetch } from "../../lib/hooks";

type BusinessRow = {
  id: number;
  name: string;
  website: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  users: { name: string; email: string }[];
  _count: { contacts: number; conversations: number; calls: number; bookings: number };
};

type RecentContact = {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  interestedService: string | null;
  status: "NEW" | "QUALIFIED" | "WON" | "LOST";
  source: string;
  createdAt: string;
  business: { id: number; name: string };
};

type OverviewData = {
  totals: { businesses: number; contacts: number; conversations: number; calls: number; bookings: number };
  businesses: BusinessRow[];
  recentContacts: RecentContact[];
};

const avatarPalette = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-teal-600"
];

const contactStatusStyle: Record<RecentContact["status"], string> = {
  NEW: "bg-blue-50 text-blue-700",
  QUALIFIED: "bg-amber-50 text-amber-700",
  WON: "bg-emerald-50 text-emerald-700",
  LOST: "bg-slate-100 text-slate-600"
};

const statChip = "rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700";

const SuperAdmin = () => {
  const { data, error } = useFetch<OverviewData>("/api/super-admin/overview");
  const totals = data?.totals;

  return (
    <section>
      <PageHeader
        label="Platform"
        title="Super Admin"
        subtitle="Full platform snapshot: every business, their leads, chats, calls, and bookings."
        right={
          <StatusPill dot>
            {totals?.businesses ?? "—"} businesses on platform
          </StatusPill>
        }
      />
      {error ? <ErrorBanner message={error} className="mt-4" /> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Businesses" value={totals?.businesses ?? "—"} icon={<span>▣</span>} note="Active tenants" />
        <MetricCard label="Contacts" value={totals?.contacts ?? "—"} icon={<span>♙</span>} note="All captured leads" />
        <MetricCard label="Conversations" value={totals?.conversations ?? "—"} icon={<span>◌</span>} note="Chat sessions" />
        <MetricCard label="Calls" value={totals?.calls ?? "—"} icon={<span>⌕</span>} note="Voice calls" />
        <MetricCard label="Bookings" value={totals?.bookings ?? "—"} icon={<span>✉</span>} note="Scheduled meetings" />
      </div>

      <div className="mt-8">
        <TableShell title="Businesses" subtitle="Per-business breakdown of leads, chats, calls, and bookings.">
          <div className="overflow-x-auto">
            <table className="data-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Admin</th>
                  <th>Status</th>
                  <th>Contacts</th>
                  <th>Chats</th>
                  <th>Calls</th>
                  <th>Bookings</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {(data?.businesses ?? []).map((business, index) => (
                  <tr key={business.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-extrabold text-white ${avatarPalette[index % avatarPalette.length]}`}>
                          {business.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{business.name}</div>
                          <div className="mt-0.5 text-xs text-slate-500">{business.website || "No website"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600">{business.users[0]?.email || "—"}</td>
                    <td>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${business.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {business.status}
                      </span>
                    </td>
                    <td>
                      <span className={statChip}>{business._count.contacts}</span>
                    </td>
                    <td>
                      <span className={statChip}>{business._count.conversations}</span>
                    </td>
                    <td>
                      <span className={statChip}>{business._count.calls}</span>
                    </td>
                    <td>
                      <span className={statChip}>{business._count.bookings}</span>
                    </td>
                    <td className="text-slate-500">{new Date(business.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {!data?.businesses?.length ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      No businesses yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </TableShell>
      </div>

      <div className="mt-8">
        <TableShell title="Recent contacts" subtitle="Latest leads from every business on the platform.">
          {data?.recentContacts?.length ? (
            <div className="overflow-x-auto">
              <table className="data-table min-w-[760px]">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Business</th>
                    <th>Interested in</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentContacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>
                        <div className="font-semibold text-slate-900">{contact.name || contact.email || contact.phone || "Unknown visitor"}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{contact.email || contact.phone || "No contact details"}</div>
                      </td>
                      <td>
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{contact.business.name}</span>
                      </td>
                      <td className="font-medium text-slate-700">{contact.interestedService || "—"}</td>
                      <td>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${contactStatusStyle[contact.status]}`}>{contact.status}</span>
                      </td>
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
            <EmptyState title="No contacts yet" description="Leads from every business will appear here as visitors interact with widgets." />
          )}
        </TableShell>
      </div>
    </section>
  );
};

export default SuperAdmin;