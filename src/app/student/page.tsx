import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { db } from "@/lib/db";
import { upcomingDates, formatDateLabel, formatTimeLabel, todayIso } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CapacityBar } from "@/components/ui/capacity-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { BookButton, CancelButton } from "@/components/booking-buttons";

const VISIBLE_DAYS = 10;

export default async function StudentPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await requireRole("STUDENT");
  const userId = session.user.id;

  const dates = upcomingDates(VISIBLE_DAYS);
  const { date: requestedDate } = await searchParams;
  const selectedDate = dates.includes(requestedDate ?? "") ? requestedDate! : dates[0];

  const [sessions, myBooking, upcomingBookings] = await Promise.all([
    db.flexSession.findMany({
      where: { date: selectedDate, status: { not: "CANCELLED" } },
      include: {
        host: true,
        bookings: { where: { status: "BOOKED" } },
      },
      orderBy: { startTime: "asc" },
    }),
    db.booking.findFirst({
      where: { studentId: userId, date: selectedDate, status: "BOOKED" },
      include: { session: true },
    }),
    db.booking.findMany({
      where: { studentId: userId, status: "BOOKED", date: { gte: todayIso() } },
      include: { session: true },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Flex sessions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Browse what&apos;s happening during Flex and book your spot.
        </p>
      </div>

      {upcomingBookings.length > 0 ? (
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Your upcoming Flex sessions
          </h2>
          <ul className="space-y-2">
            {upcomingBookings.map((booking) => (
              <li
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
              >
                <span>
                  <strong className="font-medium text-slate-900 dark:text-slate-100">
                    {booking.session.title}
                  </strong>{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    · {formatDateLabel(booking.date)} · {formatTimeLabel(booking.session.startTime)}
                  </span>
                </span>
                <CancelButton bookingId={booking.id} />
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((date) => (
          <Link
            key={date}
            href={`/student?date=${date}`}
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

      {sessions.length === 0 ? (
        <EmptyState>No Flex sessions have been posted for this day yet.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((flexSession) => {
            const bookedCount = flexSession.bookings.length;
            const isFull = bookedCount >= flexSession.capacity;
            const isMine = myBooking?.sessionId === flexSession.id;
            const blockedByOtherBooking = Boolean(myBooking) && !isMine;

            return (
              <Card key={flexSession.id} className={isMine ? "ring-2 ring-purple-500" : ""}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {flexSession.title}
                  </h3>
                  {flexSession.mandatory ? <Badge tone="amber">Required</Badge> : null}
                </div>
                {flexSession.description ? (
                  <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                    {flexSession.description}
                  </p>
                ) : null}
                <dl className="mb-3 grid grid-cols-2 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <dt className="sr-only">Host</dt>
                  <dd>{flexSession.host.name ?? flexSession.host.email}</dd>
                  <dt className="sr-only">Time</dt>
                  <dd>
                    {formatTimeLabel(flexSession.startTime)}–{formatTimeLabel(flexSession.endTime)}
                  </dd>
                  {flexSession.room ? (
                    <>
                      <dt className="sr-only">Room</dt>
                      <dd className="col-span-2">Room: {flexSession.room}</dd>
                    </>
                  ) : null}
                </dl>
                <div className="mb-3">
                  <CapacityBar booked={bookedCount} capacity={flexSession.capacity} />
                </div>

                {isMine ? (
                  <div className="space-y-1">
                    <Badge tone="green">You&apos;re booked in</Badge>
                    <CancelButton bookingId={myBooking!.id} label="Cancel my spot" />
                  </div>
                ) : (
                  <BookButton
                    sessionId={flexSession.id}
                    disabled={isFull || blockedByOtherBooking || flexSession.status !== "OPEN"}
                  />
                )}
                {blockedByOtherBooking ? (
                  <p className="mt-1 text-xs text-slate-400">
                    You&apos;re already booked into another session this day.
                  </p>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
