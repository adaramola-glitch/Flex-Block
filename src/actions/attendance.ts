"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function markAttendanceAction(bookingId: string, present: boolean) {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { session: true },
  });
  if (!booking) throw new Error("Booking not found");

  const isHost = booking.session.hostId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isHost && !isAdmin) throw new Error("Only the session host can mark attendance");

  await db.attendance.upsert({
    where: { bookingId },
    update: { present, markedById: session.user.id },
    create: { bookingId, present, markedById: session.user.id },
  });

  revalidatePath("/teacher");
  revalidatePath("/admin");
}
