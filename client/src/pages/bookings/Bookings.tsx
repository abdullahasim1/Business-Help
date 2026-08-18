import { useCallback, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import PageHeader from "../../components/ui/PageHeader";
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
          <h2 className="font-bold text-amber-900">Calendly API token set nahi hai</h2>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Bookings dekne ke liye apne Calendly account se API token chahiye:
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-amber-800">
            <li>Calendly me jaao: developer.calendly.com → Personal Access Tokens</li>
            <li>Naya token banao aur <code className="rounded bg-amber-100 px-1">CALENDLY_API_TOKEN=...</code> ko <code className="rounded bg-amber-100 px-1">.env</code> me add karo</li>
            <li>Server restart karo (main karke bataunga)</li>
          </ol>
        </div>
      ) : null}

      {data?.configured ? (
        <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          {data.synced > 0 ? `${data.synced} nayi booking sync hui` : "Sab up-to-date"}
        </div>
      ) : null}

      <TableShell className="mt-5">
        {bookings.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date &amp; time</th>
                <th>Invitee</th>
                <th>Email</th>
                <th>Event</th>
                <th>Business</th>
                <th>Lead</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div className="font-medium text-slate-900">{new Date(booking.startTime).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(booking.startTime).toLocaleTimeString()} – {new Date(booking.endTime).toLocaleTimeString()}
                    </div>
                    {booking.inviteeTimezone ? <div className="text-xs text-slate-400">{booking.inviteeTimezone}</div> : null}
                  </td>
                  <td className="font-medium text-slate-900">{booking.inviteeName || "-"}</td>
                  <td>{booking.inviteeEmail || "-"}</td>
                  <td>{booking.eventName || "-"}</td>
                  <td>{booking.business?.name || "-"}</td>
                  <td>{booking.contactId ? `Lead #${booking.contactId}` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No bookings yet" description="Appointments will appear here when visitors book through the widget." />
        )}
      </TableShell>
    </section>
  );
};

export default Bookings;