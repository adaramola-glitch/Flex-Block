import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";

/**
 * Ensures the current visitor is signed in and holds one of `allowed` roles.
 * Redirects to /login when signed out, or to their own home when signed in
 * with the wrong role. Admins are always allowed through, since they need to
 * be able to see every area for oversight.
 */
export async function requireRole(...allowed: Role[]) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role } = session.user;
  if (role !== "ADMIN" && !allowed.includes(role)) {
    redirect(ROLE_HOME[role]);
  }

  return session;
}
