import type { Role } from "@prisma/client";

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
};

export function parseEmailList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function allowedEmailDomain(): string {
  return (process.env.ALLOWED_EMAIL_DOMAIN ?? "").trim().toLowerCase();
}

export function isEmailDomainAllowed(email: string): boolean {
  const domain = allowedEmailDomain();
  if (!domain) return true;
  return email.toLowerCase().endsWith(`@${domain}`);
}

/** Role a brand-new user should be provisioned with, based on env allowlists. */
export function initialRoleForEmail(email: string): Role {
  const lower = email.toLowerCase();
  if (parseEmailList(process.env.ADMIN_EMAILS).includes(lower)) return "ADMIN";
  if (parseEmailList(process.env.TEACHER_EMAILS).includes(lower)) return "TEACHER";
  return "STUDENT";
}

export function isDevLoginEnabled(): boolean {
  return !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET;
}
