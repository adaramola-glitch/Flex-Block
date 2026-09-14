"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { parseCsv } from "@/lib/csv";

const HEADER_ALIASES: Record<string, "studentId" | "name" | "email" | "grade"> = {
  id: "studentId",
  "id#": "studentId",
  "id number": "studentId",
  "student id": "studentId",
  studentid: "studentId",
  name: "name",
  "student name": "name",
  "full name": "name",
  email: "email",
  "email address": "email",
  grade: "grade",
  "grade level": "grade",
};

export type ImportRowError = { row: number; email: string; reason: string };
export type ImportResult = {
  error?: string;
  created?: number;
  updated?: number;
  skipped?: ImportRowError[];
};

export async function importStudentsAction(
  _prevState: ImportResult,
  formData: FormData
): Promise<ImportResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Only admins can import a roster." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file first." };
  }

  const text = await file.text();
  const rows = parseCsv(text);
  if (rows.length < 2) {
    return { error: "That file doesn't have any data rows." };
  }

  const headerRow = rows[0].map((cell) => cell.trim().toLowerCase());
  const columnIndex: Partial<Record<"studentId" | "name" | "email" | "grade", number>> = {};
  headerRow.forEach((cell, i) => {
    const field = HEADER_ALIASES[cell];
    if (field) columnIndex[field] = i;
  });

  if (columnIndex.name === undefined || columnIndex.email === undefined) {
    return {
      error:
        'The file needs at least "Name" and "Email" columns (an "ID" column is recommended too).',
    };
  }

  let created = 0;
  let updated = 0;
  const skipped: ImportRowError[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    const rowNumber = i + 1; // 1-based, matching what a spreadsheet would show
    const name = (columnIndex.name !== undefined ? cells[columnIndex.name] : "")?.trim();
    const email = (columnIndex.email !== undefined ? cells[columnIndex.email] : "")
      ?.trim()
      .toLowerCase();
    const studentId =
      columnIndex.studentId !== undefined ? cells[columnIndex.studentId]?.trim() || null : null;
    const gradeRaw =
      columnIndex.grade !== undefined ? cells[columnIndex.grade]?.trim() || "" : "";
    const grade = gradeRaw ? Number.parseInt(gradeRaw, 10) : null;

    if (!email || !email.includes("@")) {
      skipped.push({ row: rowNumber, email: email || "(blank)", reason: "Missing or invalid email" });
      continue;
    }
    if (!name) {
      skipped.push({ row: rowNumber, email, reason: "Missing name" });
      continue;
    }
    if (grade !== null && (!Number.isFinite(grade) || grade < 1 || grade > 12)) {
      skipped.push({ row: rowNumber, email, reason: "Grade must be between 1 and 12" });
      continue;
    }

    try {
      const existing = await db.user.findUnique({ where: { email } });

      if (existing && existing.role !== "STUDENT") {
        skipped.push({
          row: rowNumber,
          email,
          reason: `Already has the ${existing.role} role — not overwritten`,
        });
        continue;
      }

      if (existing) {
        await db.user.update({ where: { email }, data: { name, studentId, grade } });
        updated++;
      } else {
        await db.user.create({ data: { email, name, studentId, grade, role: "STUDENT" } });
        created++;
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        skipped.push({ row: rowNumber, email, reason: "That ID number is already used by another student" });
      } else {
        skipped.push({ row: rowNumber, email, reason: "Unexpected error saving this row" });
      }
    }
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/unbooked");
  return { created, updated, skipped };
}
