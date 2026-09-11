import { db } from "@/lib/db";

export async function getAttendanceRows(from: string, to: string) {
  const sessions = await db.flexSession.findMany({
    where: { date: { gte: from, lte: to } },
    include: {
      host: true,
      bookings: {
        include: { student: true, attendance: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return sessions.flatMap((flexSession) =>
    flexSession.bookings.map((booking) => ({
      date: flexSession.date,
      sessionTitle: flexSession.title,
      host: flexSession.host.name ?? flexSession.host.email,
      studentName: booking.student.name ?? "",
      studentEmail: booking.student.email,
      bookingStatus: booking.status,
      attendance:
        booking.status === "CANCELLED"
          ? ""
          : booking.attendance
            ? booking.attendance.present
              ? "Present"
              : "Absent"
            : "Not marked",
    }))
  );
}

export type AttendanceRow = Awaited<ReturnType<typeof getAttendanceRows>>[number];

export function toCsv(rows: AttendanceRow[]): string {
  const header = ["Date", "Session", "Host", "Student", "Email", "Booking", "Attendance"];
  const escape = (value: string) =>
    /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

  const lines = rows.map((row) =>
    [
      row.date,
      row.sessionTitle,
      row.host,
      row.studentName,
      row.studentEmail,
      row.bookingStatus,
      row.attendance,
    ]
      .map(escape)
      .join(",")
  );

  return [header.join(","), ...lines].join("\n");
}
