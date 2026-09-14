import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { db } from "@/lib/db";
import { upcomingDates, formatDateLabel, todayIso } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

const VISIBLE_DAYS = 10;

export default async function UnbookedPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireRole("ADMIN");

  const dates = upcomingDates(VISIBLE_DAYS);
  const { date: requestedDate } = await searchParams;
  const selectedDate = dates.includes(requestedDate ?? "") ? requestedDate! : dates[0];

  const [allStudents, bookedStudentIds] = await Promise.all([
    db.user.findMany({
      where: { role: "STUDENT" },
      orderBy: [{ grade: "asc" }, { name: "asc" }],
    }),
    db.booking.findMany({
      where: { date: selectedDate, status: "BOOKED" },
      select: { studentId: true },
    }),
  ]);

  const bookedIds = new Set(bookedStudentIds.map((b) => b.studentId));
  const notSignedUp = allStudents.filter((student) => !bookedIds.has(student.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Not signed up
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Students with no Flex session booked for the selected day.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((date) => (
          <Link
            key={date}
            href={`/admin/unbooked?date=${date}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              date === selectedDate
                ? "bg-purple-700 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {date === todayIso() ? "Today" : formatDateLabel(date)}
          </Link>
        ))}
      </div>

      <Card>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong className="font-semibold text-slate-900 dark:text-slate-100">
            {notSignedUp.length}
          </strong>{" "}
          of {allStudents.length} students have no session booked on {formatDateLabel(selectedDate)}.
        </p>
      </Card>

      {notSignedUp.length === 0 ? (
        <EmptyState>Everyone has a Flex session booked for this day.</EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">ID number</th>
                <th className="px-4 py-2 font-medium">Grade</th>
                <th className="px-4 py-2 font-medium">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {notSignedUp.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                    {student.name ?? "—"}
                  </td>
                  <td className="px-4 py-2">{student.studentId ?? "—"}</td>
                  <td className="px-4 py-2">{student.grade ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
