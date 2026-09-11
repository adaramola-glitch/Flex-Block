import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import {
  initialRoleForEmail,
  isDevLoginEnabled,
  isEmailDomainAllowed,
} from "@/lib/roles";

const devLoginEnabled = isDevLoginEnabled();

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Only present when Google OAuth isn't configured, so this app can be
    // tried out locally before Google Workspace credentials are set up.
    // See README.md for how to turn this off for a real deployment.
    ...(devLoginEnabled
      ? [
          Credentials({
            id: "dev",
            name: "Dev sign-in",
            credentials: {
              email: { label: "School email", type: "email" },
            },
            async authorize(credentials) {
              const email = credentials?.email;
              if (typeof email !== "string" || !email.includes("@")) return null;
              if (!isEmailDomainAllowed(email)) return null;

              const user = await db.user.upsert({
                where: { email: email.toLowerCase() },
                update: {},
                create: {
                  email: email.toLowerCase(),
                  role: initialRoleForEmail(email),
                },
              });

              return { id: user.id, email: user.email, name: user.name };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      if (!isEmailDomainAllowed(user.email)) return false;

      if (account?.provider === "google") {
        await db.user.upsert({
          where: { email: user.email.toLowerCase() },
          update: { name: user.name, image: user.image },
          create: {
            email: user.email.toLowerCase(),
            name: user.name,
            image: user.image,
            role: initialRoleForEmail(user.email),
          },
        });
      }

      // The email allowlist in ADMIN_EMAILS always wins, so a mistaken role
      // change can never lock the school out of its own admin account.
      if (initialRoleForEmail(user.email) === "ADMIN") {
        await db.user.update({
          where: { email: user.email.toLowerCase() },
          data: { role: "ADMIN" },
        });
      }

      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;
      const dbUser = await db.user.findUnique({
        where: { email: token.email.toLowerCase() },
      });
      if (dbUser) {
        token.id = dbUser.id;
        token.role = dbUser.role;
        token.name = dbUser.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && typeof token.id === "string") session.user.id = token.id;
      if (token.role) session.user.role = token.role as "ADMIN" | "TEACHER" | "STUDENT";
      return session;
    },
  },
});
