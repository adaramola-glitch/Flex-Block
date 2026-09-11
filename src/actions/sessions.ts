"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export type FormActionState = { error?: string };

async function requireHost() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    throw new Error("Only teachers and admins can manage Flex sessions");
  }
  return session.user;
}

function readSessionForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const room = String(formData.get("room") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const mandatory = formData.get("mandatory") === "on";
  const requestedHostId = String(formData.get("hostId") ?? "").trim() || undefined;

  if (!title) return { error: "Give the session a title." };
  if (!date) return { error: "Pick a date." };
  if (!startTime || !endTime) return { error: "Set a start and end time." };
  if (endTime <= startTime) return { error: "End time must be after start time." };

  const capacity = Number.parseInt(capacityRaw, 10);
  if (!Number.isFinite(capacity) || capacity < 1) {
    return { error: "Capacity must be a positive number." };
  }

  return {
    data: { title, description, date, startTime, endTime, room, capacity, mandatory },
    requestedHostId,
  };
}

export async function createSessionAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const user = await requireHost();
  const parsed = readSessionForm(formData);
  if ("error" in parsed) return parsed;

  // Admins may create a session on behalf of any teacher; teachers can only
  // host their own sessions.
  let hostId = user.id;
  if (user.role === "ADMIN" && parsed.requestedHostId) {
    const host = await db.user.findUnique({ where: { id: parsed.requestedHostId } });
    if (!host || (host.role !== "TEACHER" && host.role !== "ADMIN")) {
      return { error: "Pick a valid teacher to host this session." };
    }
    hostId = host.id;
  }

  await db.flexSession.create({ data: { ...parsed.data, hostId } });

  revalidatePath("/teacher");
  revalidatePath("/admin");
  revalidatePath("/student");
  redirect(user.role === "ADMIN" ? "/admin" : "/teacher");
}

async function assertCanManage(sessionId: string) {
  const user = await requireHost();
  const flexSession = await db.flexSession.findUnique({ where: { id: sessionId } });
  if (!flexSession) throw new Error("Session not found");
  if (user.role !== "ADMIN" && flexSession.hostId !== user.id) {
    throw new Error("You can only manage your own sessions.");
  }
  return { user, flexSession };
}

export async function updateSessionAction(
  sessionId: string,
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const { user } = await assertCanManage(sessionId);
  const parsed = readSessionForm(formData);
  if ("error" in parsed) return parsed;

  let hostId: string | undefined;
  if (user.role === "ADMIN" && parsed.requestedHostId) {
    const host = await db.user.findUnique({ where: { id: parsed.requestedHostId } });
    if (!host || (host.role !== "TEACHER" && host.role !== "ADMIN")) {
      return { error: "Pick a valid teacher to host this session." };
    }
    hostId = host.id;
  }

  await db.flexSession.update({
    where: { id: sessionId },
    data: { ...parsed.data, ...(hostId ? { hostId } : {}) },
  });

  revalidatePath("/teacher");
  revalidatePath("/admin");
  revalidatePath("/student");
  redirect(user.role === "ADMIN" ? `/admin/sessions/${sessionId}` : `/teacher/sessions/${sessionId}`);
}

export async function deleteSessionAction(sessionId: string) {
  const { user } = await assertCanManage(sessionId);
  await db.flexSession.delete({ where: { id: sessionId } });

  revalidatePath("/teacher");
  revalidatePath("/admin");
  revalidatePath("/student");
  redirect(user.role === "ADMIN" ? "/admin" : "/teacher");
}

export async function setSessionStatusAction(
  sessionId: string,
  status: "OPEN" | "CLOSED" | "CANCELLED"
) {
  await assertCanManage(sessionId);
  await db.flexSession.update({ where: { id: sessionId }, data: { status } });

  revalidatePath("/teacher");
  revalidatePath("/admin");
  revalidatePath("/student");
}
