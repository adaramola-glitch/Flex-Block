import { notFound } from "next/navigation";
import { requireRole } from "@/lib/require-role";
import { db } from "@/lib/db";
import { SessionDetail } from "@/components/session-detail";

export default async function TeacherSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("TEACHER");
  const { id } = await params;

  const flexSession = await db.flexSession.findUnique({ where: { id } });
  if (!flexSession) notFound();
  if (session.user.role !== "ADMIN" && flexSession.hostId !== session.user.id) notFound();

  return <SessionDetail sessionId={id} backHref="/teacher" editHref={`/teacher/sessions/${id}/edit`} />;
}
