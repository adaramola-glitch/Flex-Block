import type { ReactNode } from "react";
import { requireRole } from "@/lib/require-role";
import { AppShell } from "@/components/app-shell";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("TEACHER");
  return <AppShell session={session}>{children}</AppShell>;
}
