"use server";

import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function setUserRoleAction(userId: string, role: Role) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Only admins can change roles");
  }

  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export type FormActionState = { error?: string };

export async function setStudentDetailsAction(
  userId: string,
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Only admins can edit student details." };
  }

  const studentIdRaw = String(formData.get("studentId") ?? "").trim();
  const gradeRaw = String(formData.get("grade") ?? "").trim();

  const grade = gradeRaw ? Number.parseInt(gradeRaw, 10) : null;
  if (grade !== null && (!Number.isFinite(grade) || grade < 1 || grade > 12)) {
    return { error: "Grade must be between 1 and 12." };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { studentId: studentIdRaw || null, grade },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That ID number is already used by another student." };
    }
    throw error;
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/unbooked");
  return {};
}
