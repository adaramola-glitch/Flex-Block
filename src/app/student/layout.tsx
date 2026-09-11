import type { ReactNode } from "react";
import { requireRole } from "@/lib/require-role";
import { AppShell } from "@/components/app-shell";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await requireRole("STUDENT");
  return <AppShell session={session}>{children}</AppShell>;
}
