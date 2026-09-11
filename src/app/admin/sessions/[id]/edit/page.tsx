import { notFound } from "next/navigation";
import { requireRole } from "@/lib/require-role";
import { db } from "@/lib/db";
import { updateSessionAction } from "@/actions/sessions";
import { SessionForm } from "@/components/session-form";
import { Card } from "@/components/ui/card";

export default async function EditAdminSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const [flexSession, teachers] = await Promise.all([
    db.flexSession.findUnique({ where: { id } }),
    db.user.findMany({ where: { role: { in: ["TEACHER", "ADMIN"] } }, orderBy: { name: "asc" } }),
  ]);
  if (!flexSession) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Edit session</h1>
      <Card>
        <SessionForm
          action={updateSessionAction.bind(null, id)}
          submitLabel="Save changes"
          teachers={teachers}
          defaults={{
            title: flexSession.title,
            description: flexSession.description,
            date: flexSession.date,
            startTime: flexSession.startTime,
            endTime: flexSession.endTime,
            room: flexSession.room,
            capacity: flexSession.capacity,
            mandatory: flexSession.mandatory,
            hostId: flexSession.hostId,
          }}
        />
      </Card>
    </div>
  );
}
