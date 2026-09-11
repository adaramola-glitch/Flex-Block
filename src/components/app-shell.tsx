import type { ReactNode } from "react";
import Link from "next/link";
import type { Session } from "next-auth";
import { signOutAction } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";

const roleTone = { ADMIN: "amber", TEACHER: "blue", STUDENT: "green" } as const;

const navLinks: Record<string, { href: string; label: string }[]> = {
  STUDENT: [{ href: "/student", label: "Flex sessions" }],
  TEACHER: [{ href: "/teacher", label: "My sessions" }],
  ADMIN: [
    { href: "/admin", label: "All sessions" },
    { href: "/admin/users", label: "People" },
    { href: "/admin/reports", label: "Reports" },
  ],
};

export function AppShell({
  session,
  children,
}: {
  session: Session;
  children: ReactNode;
}) {
  const { user } = session;
  const links = navLinks[user.role] ?? [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Flex Block
            </Link>
            <nav className="flex items-center gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-700 dark:text-slate-300">
                {user.name ?? user.email}
              </span>
              <Badge tone={roleTone[user.role]}>{user.role}</Badge>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
