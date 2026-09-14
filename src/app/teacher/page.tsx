import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { db } from "@/lib/db";
import { todayIso, formatDateLabel, formatTimeLabel } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CapacityBar } from "@/components/ui/capacity-bar";
import { EmptyState } from "@/components/ui/empty-state";

export default async function TeacherPage() {
  const session = await requireRole("TEACHER");

  const sessions = await db.flexSession.findMany({
    where: { hostId: session.user.id },
    include: { bookings: { where: { status: "BOOKED" } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const today = todayIso();
  const upcoming = sessions.filter((s) => s.date >= today);
  const past = sessions.filter((s) => s.date < today);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            My Flex sessions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create sessions for students to book into, and mark attendance.
          </p>
        </div>
        <Link
          href="/teacher/sessions/new"
          className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600"
        >
          + New session
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState>You haven&apos;t posted any upcoming sessions yet.</EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((s) => (
              <SessionCard key={s.id} flexSession={s} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Past
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {past.slice(0, 6).map((s) => (
              <SessionCard key={s.id} flexSession={s} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SessionCard({
  flexSession,
}: {
  flexSession: {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    capacity: number;
    mandatory: boolean;
    status: string;
    bookings: unknown[];
  };
}) {
  return (
    <Link href={`/teacher/sessions/${flexSession.id}`}>
      <Card className="h-full transition hover:border-slate-300 dark:hover:border-slate-600">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {flexSession.title}
          </h3>
          <div className="flex gap-1">
            {flexSession.mandatory ? <Badge tone="amber">Required</Badge> : null}
            {flexSession.status !== "OPEN" ? (
              <Badge tone={flexSession.status === "CANCELLED" ? "red" : "slate"}>
                {flexSession.status}
              </Badge>
            ) : null}
          </div>
        </div>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {formatDateLabel(flexSession.date)} · {formatTimeLabel(flexSession.startTime)}–
          {formatTimeLabel(flexSession.endTime)}
          {flexSession.room ? ` · ${flexSession.room}` : ""}
        </p>
        <CapacityBar booked={flexSession.bookings.length} capacity={flexSession.capacity} />
      </Card>
    </Link>
  );
}
