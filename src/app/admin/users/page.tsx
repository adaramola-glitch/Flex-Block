import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { Card } from "@/components/ui/card";
import { RoleSelect } from "@/components/role-select";
import { StudentDetailsForm } from "@/components/student-details-form";

export default async function AdminUsersPage() {
  await requireRole("ADMIN");
  const users = await db.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">People</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Everyone who has signed in, and their role. New sign-ins default to Student. Add a
          student&apos;s ID number and grade so they show up on rosters and the sign-up list.
        </p>
      </div>

      <Card className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user.name ?? "—"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {user.role === "STUDENT" ? (
                  <StudentDetailsForm
                    userId={user.id}
                    studentId={user.studentId}
                    grade={user.grade}
                  />
                ) : null}
                <RoleSelect userId={user.id} role={user.role} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
