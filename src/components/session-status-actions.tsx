"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSessionStatusAction, deleteSessionAction } from "@/actions/sessions";

type Status = "OPEN" | "CLOSED" | "CANCELLED";

export function SessionStatusActions({
  sessionId,
  status,
}: {
  sessionId: string;
  status: Status;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function setStatus(next: Status) {
    startTransition(async () => {
      await setSessionStatusAction(sessionId, next);
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm("Delete this session and all of its bookings? This can't be undone.")) {
      return;
    }
    // deleteSessionAction redirects on success, which the transition follows automatically.
    startTransition(() => deleteSessionAction(sessionId));
  }

  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {status !== "OPEN" ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus("OPEN")}
          className={buttonClass}
        >
          Reopen
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus("CLOSED")}
          className={buttonClass}
        >
          Close bookings
        </button>
      )}
      {status !== "CANCELLED" ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => setStatus("CANCELLED")}
          className={buttonClass}
        >
          Cancel session
        </button>
      ) : null}
      <button
        type="button"
        disabled={isPending}
        onClick={remove}
        className="rounded-lg border border-red-200 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
      >
        Delete
      </button>
    </div>
  );
}

const buttonClass =
  "rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800";
