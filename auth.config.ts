import Credentials from "next-auth/providers/credentials";
import { AuthError, type NextAuthConfig } from "next-auth";
import { LoginSchema } from "@/schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { addMinutes, isBefore, differenceInMinutes } from "date-fns";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 10; // in minutes
const RESET_DURATION = 3; // in minutes

export default {
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user) return null;

          const now = new Date();

          if (user.status === "BANNED") throw new AuthError("BannedUser");

          if (user.password === null) throw new AuthError("FirstLogin");

          // Check if the user is locked out
          if (user.lockoutUntil && isBefore(now, user.lockoutUntil)) {
            throw new AuthError("TemporarilyLocked");
          }

          // Reset failed attempts if the last failed attempt was more than RESET_DURATION minutes ago
          if (
            user.lastFailedAttempt &&
            differenceInMinutes(now, user.lastFailedAttempt) > RESET_DURATION
          ) {
            await db.user.update({
              where: { id: user.id },
              data: { failedAttempts: 0 },
            });
          }

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            // Reset failed attempts on successful login
            await db.user.update({
              where: { id: user.id },
              data: { failedAttempts: 0, lockoutUntil: null },
            });
            return user;
          } else {
            // Increment failed attempts
            const newFailedAttempts = user.failedAttempts + 1;

            let lockoutUntil = null;
            if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
              lockoutUntil = addMinutes(now, LOCKOUT_DURATION);
            }

            await db.user.update({
              where: { id: user.id },
              data: { failedAttempts: newFailedAttempts, lockoutUntil },
            });

            if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
              throw new AuthError("TemporarilyLocked");
            }

            return null;
          }
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user?.id) {
        return false;
      }

      const existingUser = await getUserById(user.id);
      if (!existingUser) return false;
      if (existingUser.status === "BANNED") {
        throw new AuthError("BannedUser via signin");
      }

      return true;
    },
    async session({ token, session }) {
      if (token.status && session.user) {
        if (token.status === "BANNED") {
          throw new AuthError("BannedUser via session");
        }
        session.user.status = token.status;
      }

      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }
      if (token.gender && session.user) {
        session.user.gender = token.gender;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      token.role = existingUser.role;
      token.status = existingUser.status;
      token.gender = existingUser.gender;

      return token;
    },
  },
  session: { strategy: "jwt", maxAge: 60 * 60 },
  jwt: { maxAge: 60 * 60 },
  adapter: PrismaAdapter(db),
} satisfies NextAuthConfig;
