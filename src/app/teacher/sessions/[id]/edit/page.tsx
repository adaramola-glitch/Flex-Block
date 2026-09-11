import { notFound } from "next/navigation";
import { requireRole } from "@/lib/require-role";
import { db } from "@/lib/db";
import { updateSessionAction } from "@/actions/sessions";
import { SessionForm } from "@/components/session-form";
import { Card } from "@/components/ui/card";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("TEACHER");
  const { id } = await params;

  const flexSession = await db.flexSession.findUnique({ where: { id } });
  if (!flexSession) notFound();
  if (session.user.role !== "ADMIN" && flexSession.hostId !== session.user.id) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Edit session</h1>
      <Card>
        <SessionForm
          action={updateSessionAction.bind(null, id)}
          submitLabel="Save changes"
          defaults={{
            title: flexSession.title,
            description: flexSession.description,
            date: flexSession.date,
            startTime: flexSession.startTime,
            endTime: flexSession.endTime,
            room: flexSession.room,
            capacity: flexSession.capacity,
            mandatory: flexSession.mandatory,
          }}
        />
      </Card>
    </div>
  );
}
