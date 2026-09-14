"use client";

import { useActionState } from "react";
import { forceAssignAction, type FormActionState } from "@/actions/bookings";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatDateLabel, formatTimeLabel } from "@/lib/dates";

type SessionOption = { id: string; title: string; date: string; startTime: string };
type StudentOption = { id: string; name: string | null; email: string };

const initialState: FormActionState = {};

export function ForceAssignForm({
  sessions,
  students,
}: {
  sessions: SessionOption[];
  students: StudentOption[];
}) {
  const [state, formAction] = useActionState(forceAssignAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">Student</span>
        <select name="studentId" required className={selectClass}>
          <option value="">Choose a student…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name ?? s.email}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
          Into session
        </span>
        <select name="sessionId" required className={selectClass}>
          <option value="">Choose a session…</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {formatDateLabel(s.date)} {formatTimeLabel(s.startTime)} · {s.title}
            </option>
          ))}
        </select>
      </label>
      <SubmitButton pendingText="Assigning…">Force-assign</SubmitButton>
      {state.error ? (
        <p className="text-sm text-red-600 sm:col-span-3">{state.error}</p>
      ) : null}
    </form>
  );
}

const selectClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
