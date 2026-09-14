"use client";

import { useActionState } from "react";
import { setStudentDetailsAction, type FormActionState } from "@/actions/users";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: FormActionState = {};

export function StudentDetailsForm({
  userId,
  studentId,
  grade,
}: {
  userId: string;
  studentId: string | null;
  grade: number | null;
}) {
  const [state, formAction] = useActionState(
    setStudentDetailsAction.bind(null, userId),
    initialState
  );

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        name="studentId"
        defaultValue={studentId ?? ""}
        placeholder="ID number"
        className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />
      <select
        name="grade"
        defaultValue={grade ?? ""}
        className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-900 focus:border-purple-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">Grade</option>
        <option value="9">9</option>
        <option value="10">10</option>
        <option value="11">11</option>
        <option value="12">12</option>
      </select>
      <SubmitButton pendingText="Saving…" variant="outline" className="px-3 py-1 text-xs">
        Save
      </SubmitButton>
      {state.error ? <p className="w-full text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
