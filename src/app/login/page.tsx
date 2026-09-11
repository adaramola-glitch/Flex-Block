import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isDevLoginEnabled, ROLE_HOME } from "@/lib/roles";
import { googleLoginAction } from "@/actions/auth";
import { DevLoginForm } from "@/components/auth/dev-login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect(ROLE_HOME[session.user.role]);

  const devLogin = isDevLoginEnabled();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            Flex Block
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in with your Da Vinci Schools account
          </p>
        </div>

        <form action={googleLoginAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>

        {devLogin ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Dev sign-in
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google sign-in isn&apos;t configured yet, so you can sign in
                with any @{process.env.ALLOWED_EMAIL_DOMAIN || "school"}{" "}
                email for testing. See README.md to set up real Google
                sign-in.
              </p>
              <DevLoginForm
                sampleEmails={[
                  "adaramola@davincischools.org",
                  "teacher@davincischools.org",
                  "student1@davincischools.org",
                ]}
              />
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.44c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.29V6.6H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.4z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
