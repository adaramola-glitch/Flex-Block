"use client";

import { useActionState } from "react";
import { devLoginAction, type DevLoginState } from "@/actions/auth";

const initialState: DevLoginState = {};

export function DevLoginForm({ sampleEmails }: { sampleEmails: string[] }) {
  const [state, formAction, pending] = useActionState(devLoginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        School email
        <input
          type="email"
          name="email"
          required
          placeholder="student1@davincischools.org"
          list="sample-emails"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <datalist id="sample-emails">
          {sampleEmails.map((email) => (
            <option key={email} value={email} />
          ))}
        </datalist>
      </label>
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-200 dark:text-slate-900"
      >
        {pending ? "Signing in…" : "Continue with dev sign-in"}
      </button>
    </form>
  );
}
