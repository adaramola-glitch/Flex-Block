import Link from "next/link";
import { db } from "@/lib/db";
import { upcomingDates, formatDateLabel, formatTimeLabel, todayIso } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CapacityBar } from "@/components/ui/capacity-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ForceAssignForm } from "@/components/force-assign-form";

const VISIBLE_DAYS = 10;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const dates = upcomingDates(VISIBLE_DAYS);
  const { date: requestedDate } = await searchParams;
  const selectedDate = dates.includes(requestedDate ?? "") ? requestedDate! : dates[0];

  const [sessions, students, upcomingSessions] = await Promise.all([
    db.flexSession.findMany({
      where: { date: selectedDate },
      include: { host: true, bookings: { where: { status: "BOOKED" } } },
      orderBy: { startTime: "asc" },
    }),
    db.user.findMany({ where: { role: "STUDENT" }, orderBy: { name: "asc" } }),
    db.flexSession.findMany({
      where: { date: { gte: todayIso() }, status: "OPEN" },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            All Flex sessions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Oversee every session across the school.
          </p>
        </div>
        <Link
          href="/admin/sessions/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
        >
          + New session
        </Link>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Force-assign a student
        </h2>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Places a student into a session even if it&apos;s full or they&apos;re already booked
          elsewhere that day — useful for mandatory interventions.
        </p>
        <ForceAssignForm sessions={upcomingSessions} students={students} />
      </Card>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((date) => (
          <Link
            key={date}
            href={`/admin?date=${date}`}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              date === selectedDate
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {date === todayIso() ? "Today" : formatDateLabel(date)}
          </Link>
        ))}
      </div>

      {sessions.length === 0 ? (
        <EmptyState>No Flex sessions have been posted for this day yet.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((flexSession) => (
            <Link key={flexSession.id} href={`/admin/sessions/${flexSession.id}`}>
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
                  {flexSession.host.name ?? flexSession.host.email} ·{" "}
                  {formatTimeLabel(flexSession.startTime)}–{formatTimeLabel(flexSession.endTime)}
                  {flexSession.room ? ` · ${flexSession.room}` : ""}
                </p>
                <CapacityBar booked={flexSession.bookings.length} capacity={flexSession.capacity} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
