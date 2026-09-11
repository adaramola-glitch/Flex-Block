"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export type FormActionState = { error?: string };

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  return session.user;
}

/** A student booking themselves into an open session. */
export async function bookSessionAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const user = await requireUser();
  if (user.role !== "STUDENT") {
    return { error: "Only students book their own Flex sessions." };
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const flexSession = await db.flexSession.findUnique({
    where: { id: sessionId },
    include: { _count: { select: { bookings: { where: { status: "BOOKED" } } } } },
  });
  if (!flexSession) return { error: "That session no longer exists." };
  if (flexSession.status !== "OPEN") return { error: "That session isn't open for booking." };
  if (flexSession._count.bookings >= flexSession.capacity) {
    return { error: "That session is full." };
  }

  const existing = await db.booking.findFirst({
    where: { studentId: user.id, date: flexSession.date, status: "BOOKED" },
  });
  if (existing) {
    return {
      error:
        "You already have a Flex session booked for that day. Cancel it first if you want to switch.",
    };
  }

  await db.booking.create({
    data: { sessionId, studentId: user.id, date: flexSession.date },
  });

  revalidatePath("/student");
  return {};
}

/** A student cancelling their own booking, or a teacher/admin removing a
 * student from their session's roster. */
export async function cancelBookingAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") ?? "");

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { session: true },
  });
  if (!booking) return { error: "That booking no longer exists." };

  const isOwner = booking.studentId === user.id;
  const isHost = booking.session.hostId === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isHost && !isAdmin) {
    return { error: "You can't cancel that booking." };
  }

  await db.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });

  revalidatePath("/student");
  revalidatePath("/teacher");
  revalidatePath("/admin");
  return {};
}

/** Admin-only: place a student into a session regardless of capacity or
 * their existing booking for that day (e.g. a mandatory intervention). */
export async function forceAssignAction(
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const user = await requireUser();
  if (user.role !== "ADMIN") return { error: "Only admins can force-assign students." };

  const sessionId = String(formData.get("sessionId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  if (!sessionId || !studentId) return { error: "Pick both a session and a student." };

  const [flexSession, student] = await Promise.all([
    db.flexSession.findUnique({ where: { id: sessionId } }),
    db.user.findUnique({ where: { id: studentId } }),
  ]);
  if (!flexSession) return { error: "That session no longer exists." };
  if (!student || student.role !== "STUDENT") return { error: "Pick a valid student." };

  await db.$transaction(async (tx) => {
    await tx.booking.updateMany({
      where: { studentId, date: flexSession.date, status: "BOOKED" },
      data: { status: "CANCELLED" },
    });
    await tx.booking.create({
      data: {
        sessionId,
        studentId,
        date: flexSession.date,
        assignedById: user.id,
      },
    });
  });

  revalidatePath("/student");
  revalidatePath("/teacher");
  revalidatePath("/admin");
  return {};
}
