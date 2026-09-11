"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { setUserRoleAction } from "@/actions/users";

const ROLES: Role[] = ["STUDENT", "TEACHER", "ADMIN"];

export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      defaultValue={role}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as Role;
        startTransition(async () => {
          await setUserRoleAction(userId, next);
          router.refresh();
        });
      }}
      className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
