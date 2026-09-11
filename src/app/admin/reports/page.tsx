import { requireRole } from "@/lib/require-role";
import { getAttendanceRows } from "@/lib/reports";
import { isoDateFromOffset, formatDateLabel } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireRole("ADMIN");

  const params = await searchParams;
  const from = params.from || isoDateFromOffset(-7);
  const to = params.to || isoDateFromOffset(7);

  const rows = await getAttendanceRows(from, to);
  const present = rows.filter((r) => r.attendance === "Present").length;
  const absent = rows.filter((r) => r.attendance === "Absent").length;
  const unmarked = rows.filter((r) => r.attendance === "Not marked").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Attendance across all Flex sessions in a date range.
        </p>
      </div>

      <Card>
        <form className="flex flex-wrap items-end gap-3" method="get">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">From</span>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">To</span>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Update
          </button>
          <a
            href={`/api/admin/reports?from=${from}&to=${to}`}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
          >
            Download CSV
          </a>
        </form>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Present" value={present} tone="green" />
        <Stat label="Absent" value={absent} tone="red" />
        <Stat label="Not yet marked" value={unmarked} tone="slate" />
      </div>

      {rows.length === 0 ? (
        <EmptyState>No bookings in this date range yet.</EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Session</th>
                <th className="px-4 py-2 font-medium">Host</th>
                <th className="px-4 py-2 font-medium">Student</th>
                <th className="px-4 py-2 font-medium">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2 whitespace-nowrap">{formatDateLabel(row.date)}</td>
                  <td className="px-4 py-2">{row.sessionTitle}</td>
                  <td className="px-4 py-2">{row.host}</td>
                  <td className="px-4 py-2">{row.studentName || row.studentEmail}</td>
                  <td className="px-4 py-2">
                    {row.bookingStatus === "CANCELLED" ? (
                      <Badge tone="slate">Cancelled</Badge>
                    ) : row.attendance === "Present" ? (
                      <Badge tone="green">Present</Badge>
                    ) : row.attendance === "Absent" ? (
                      <Badge tone="red">Absent</Badge>
                    ) : (
                      <Badge tone="amber">Not marked</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "green" | "red" | "slate" }) {
  const toneClass = {
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    slate: "text-slate-600 dark:text-slate-400",
  }[tone];
  return (
    <Card>
      <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </Card>
  );
}
