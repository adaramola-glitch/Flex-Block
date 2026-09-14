"use client";

import { useActionState } from "react";
import { importStudentsAction, type ImportResult } from "@/actions/import";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ImportResult = {};

export function ImportForm() {
  const [state, formAction] = useActionState(importStudentsAction, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200"
        />
        <SubmitButton pendingText="Importing…">Import</SubmitButton>
      </form>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      {state.created !== undefined ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <strong className="font-semibold text-green-700 dark:text-green-400">
              {state.created}
            </strong>{" "}
            new student{state.created === 1 ? "" : "s"} added,{" "}
            <strong className="font-semibold text-purple-700 dark:text-purple-400">
              {state.updated}
            </strong>{" "}
            updated
            {state.skipped && state.skipped.length > 0 ? (
              <>
                {" "}
                ,{" "}
                <strong className="font-semibold text-red-600 dark:text-red-400">
                  {state.skipped.length}
                </strong>{" "}
                skipped
              </>
            ) : null}
            .
          </p>

          {state.skipped && state.skipped.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Row</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Why it was skipped</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {state.skipped.map((row) => (
                    <tr key={row.row}>
                      <td className="px-3 py-2">{row.row}</td>
                      <td className="px-3 py-2">{row.email}</td>
                      <td className="px-3 py-2 text-red-600 dark:text-red-400">{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
