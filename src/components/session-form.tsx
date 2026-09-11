"use client";

import { useActionState } from "react";
import type { FormActionState } from "@/actions/sessions";
import { SubmitButton } from "@/components/ui/submit-button";

type Teacher = { id: string; name: string | null; email: string };

export function SessionForm({
  action,
  submitLabel,
  defaults,
  teachers,
}: {
  action: (prevState: FormActionState, formData: FormData) => Promise<FormActionState>;
  submitLabel: string;
  defaults?: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    capacity: number;
    mandatory: boolean;
    hostId?: string;
  };
  teachers?: Teacher[];
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Title">
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          placeholder="e.g. Algebra II Help Session"
          className={inputClass}
        />
      </Field>

      <Field label="Description (optional)">
        <textarea
          name="description"
          defaultValue={defaults?.description}
          rows={2}
          placeholder="What will students do in this session?"
          className={inputClass}
        />
      </Field>

      {teachers ? (
        <Field label="Hosted by">
          <select name="hostId" defaultValue={defaults?.hostId} className={inputClass}>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name ?? teacher.email}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date">
          <input
            type="date"
            name="date"
            required
            defaultValue={defaults?.date}
            className={inputClass}
          />
        </Field>
        <Field label="Room (optional)">
          <input name="room" defaultValue={defaults?.room} className={inputClass} />
        </Field>
        <Field label="Start time">
          <input
            type="time"
            name="startTime"
            required
            defaultValue={defaults?.startTime}
            className={inputClass}
          />
        </Field>
        <Field label="End time">
          <input
            type="time"
            name="endTime"
            required
            defaultValue={defaults?.endTime}
            className={inputClass}
          />
        </Field>
        <Field label="Capacity">
          <input
            type="number"
            name="capacity"
            min={1}
            required
            defaultValue={defaults?.capacity ?? 20}
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            name="mandatory"
            defaultChecked={defaults?.mandatory}
            className="h-4 w-4 rounded border-slate-300"
          />
          Required session
        </label>
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";
