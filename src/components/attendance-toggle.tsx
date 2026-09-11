"use client";

import { useTransition } from "react";
import { markAttendanceAction } from "@/actions/attendance";

export function AttendanceToggle({
  bookingId,
  present,
}: {
  bookingId: string;
  present: boolean | null;
}) {
  const [isPending, startTransition] = useTransition();

  function mark(value: boolean) {
    startTransition(() => {
      markAttendanceAction(bookingId, value);
    });
  }

  return (
    <div className="flex gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() => mark(true)}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
          present === true
            ? "bg-green-600 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-green-100 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        Present
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => mark(false)}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition disabled:opacity-50 ${
          present === false
            ? "bg-red-600 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-red-100 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        Absent
      </button>
    </div>
  );
}
