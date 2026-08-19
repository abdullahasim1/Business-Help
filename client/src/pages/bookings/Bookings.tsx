import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import MetricCard from "../../components/MetricCard";
import PageHeader from "../../components/ui/PageHeader";
import StatusPill from "../../components/ui/StatusPill";
import TableShell from "../../components/ui/TableShell";
import { api } from "../../lib/api";

type Booking = {
  id: number;
  eventName: string | null;
  inviteeName: string | null;
  inviteeEmail: string | null;
  inviteeTimezone: string | null;
  startTime: string;
  endTime: string;
  business: { name: string } | null;
  contactId: number | null;
};

type BookingsResponse = {
  configured: boolean;
  synced: number;
  bookings: Booking[];
};

const Bookings = () => {
  const [data, setData] = useState<BookingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await api<BookingsResponse>("/api/bookings"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const syncNow = async () => {
    setSyncing(true);
    try {
      await api<{ synced: number }>("/api/bookings/sync", { method: "POST" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const bookings = data?.bookings ?? [];
  const upcoming = bookings.filter((b) => new Date(b.startTime) > new Date());
  const past = bookings.filter((b) => new Date(b.startTime) <= new Date());

  const stats = [
    { label: "Total bookings", value: bookings.length, icon: "📅", iconBg: "bg-violet-50", note: "All appointments" },
    { label: "Upcoming", value: upcoming.length, icon: "▶", iconBg: "bg-blue-50", note: "Future appointments" },
    { label: "Completed", value: past.length, icon: "✓", iconBg: "bg-emerald-50", note: "Past appointments" }
  ];

  return (
    <section>
      <PageHeader
        title="Bookings"
        subtitle="Appointments scheduled through Calendly."
        right={
          <Button onClick={syncNow} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync now"}
          </Button>
        }
      />

      {error ? <ErrorBanner message={error} className="mt-4" /> : null}

      {!data?.configured ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-bold text-amber-900">Calendly API token not configured</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            To view bookings, add your Calendly API token:
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-amber-800">
            <li>Go to developer.calendly.com → Personal Access Tokens</li>
            <li>Create a token and add <code className="rounded bg-amber-100 px-1">CALENDLY_API_TOKEN=...</code> to <code className="rounded bg-amber-100 px-1">.env</code></li>
            <li>Restart the server</li>
          </ol>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <MetricCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} iconBg={stat.iconBg} note={stat.note} />
            ))}
          </div>

          {data?.configured ? (
            <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              {data.synced > 0 ? `${data.synced} new bookings synced` : "All up-to-date"}
            </div>
          ) : null}

          <TableShell className="mt-5">
            {bookings.length ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & time</th>
                    <th>Invitee</th>
                    <th>Email</th>
                    <th>Event</th>
                    <th>Business</th>
                    <th>Lead</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <Link key={booking.id} to={`/dashboard/bookings/${booking.id}`} className="transition hover:bg-slate-50">
                      <tr>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-50 text-xs font-extrabold text-violet-600">📅</div>
                            <div>
                              <div className="font-medium text-slate-900">{new Date(booking.startTime).toLocaleDateString()}</div>
                              <div className="text-xs text-slate-500">
                                {new Date(booking.startTime).toLocaleTimeString()} – {new Date(booking.endTime).toLocaleTimeString()}
                              </div>
                              {booking.inviteeTimezone ? <div className="text-xs text-slate-400">{booking.inviteeTimezone}</div> : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-900">{booking.inviteeName || "—"}</td>
                        <td className="px-5 py-4">{booking.inviteeEmail || "—"}</td>
                        <td className="px-5 py-4">{booking.eventName || "—"}</td>
                        <td className="px-5 py-4">{booking.business?.name || "—"}</td>
                        <td className="px-5 py-4">{booking.contactId ? `Lead #${booking.contactId}` : "—"}</td>
                      </tr>
                    </Link>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No bookings yet" description="Appointments will appear here when visitors book through the widget." />
            )}
          </TableShell>
        </>
      )}
    </section>
  );
};

export default Bookings;