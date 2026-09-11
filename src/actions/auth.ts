"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export async function googleLoginAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export type DevLoginState = { error?: string };

export async function devLoginAction(
  _prevState: DevLoginState,
  formData: FormData
): Promise<DevLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter an email address." };

  try {
    await signIn("dev", { email, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "That email isn't allowed to sign in. Check the domain restriction in your .env file.",
      };
    }
    throw error;
  }

  return {};
}
