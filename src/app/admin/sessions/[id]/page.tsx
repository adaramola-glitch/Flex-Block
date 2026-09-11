import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { SessionDetail } from "@/components/session-detail";

export default async function AdminSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;

  const exists = await db.flexSession.findUnique({ where: { id }, select: { id: true } });
  if (!exists) notFound();

  return <SessionDetail sessionId={id} backHref="/admin" editHref={`/admin/sessions/${id}/edit`} />;
}
