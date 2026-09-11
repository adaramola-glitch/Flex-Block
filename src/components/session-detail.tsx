import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatDateLabel, formatTimeLabel } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CapacityBar } from "@/components/ui/capacity-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { AttendanceToggle } from "@/components/attendance-toggle";
import { CancelButton } from "@/components/booking-buttons";
import { SessionStatusActions } from "@/components/session-status-actions";

export async function SessionDetail({
  sessionId,
  backHref,
  editHref,
}: {
  sessionId: string;
  backHref: string;
  editHref: string;
}) {
  const flexSession = await db.flexSession.findUnique({
    where: { id: sessionId },
    include: {
      host: true,
      bookings: {
        where: { status: "BOOKED" },
        include: { student: true, attendance: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!flexSession) notFound();

  return (
    <div className="space-y-6">
      <Link href={backHref} className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400">
        ← Back
      </Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {flexSession.title}
              </h1>
              {flexSession.mandatory ? <Badge tone="amber">Required</Badge> : null}
              <Badge tone={flexSession.status === "CANCELLED" ? "red" : "slate"}>
                {flexSession.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hosted by {flexSession.host.name ?? flexSession.host.email}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {formatDateLabel(flexSession.date)} · {formatTimeLabel(flexSession.startTime)}–
              {formatTimeLabel(flexSession.endTime)}
              {flexSession.room ? ` · ${flexSession.room}` : ""}
            </p>
            {flexSession.description ? (
              <p className="mt-2 max-w-prose text-sm text-slate-600 dark:text-slate-400">
                {flexSession.description}
              </p>
            ) : null}
          </div>
          <Link
            href={editHref}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Edit
          </Link>
        </div>

        <div className="mt-4 max-w-xs">
          <CapacityBar booked={flexSession.bookings.length} capacity={flexSession.capacity} />
        </div>

        <div className="mt-4">
          <SessionStatusActions sessionId={flexSession.id} status={flexSession.status} />
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Roster ({flexSession.bookings.length})
        </h2>
        {flexSession.bookings.length === 0 ? (
          <EmptyState>No students booked yet.</EmptyState>
        ) : (
          <Card className="divide-y divide-slate-100 p-0 dark:divide-slate-800">
            {flexSession.bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {booking.student.name ?? booking.student.email}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {booking.student.email}
                    {booking.assignedById ? " · assigned by admin" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AttendanceToggle
                    bookingId={booking.id}
                    present={booking.attendance?.present ?? null}
                  />
                  <CancelButton bookingId={booking.id} label="Remove" />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
