import Credentials from "next-auth/providers/credentials";
import { AuthError, type NextAuthConfig } from "next-auth";
import { LoginSchema } from "@/schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user) return null;
          if (user.status === "BANNED") throw new AuthError("BannedUser");

          const passwordMath = await bcrypt.compare(password, user.password);
          if (passwordMath) return user;
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

      if (!existingUser || existingUser.status === "BANNED") {
        throw new AuthError("BannedUser");
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      if (token.status && session.user) {
        session.user.status = token.status;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      token.role = existingUser.role;
      token.status = existingUser.status;

      return token;
    },
  },
  session: { strategy: "jwt", maxAge: 365 * 24 * 60 * 60 },
  jwt: { maxAge: 365 * 24 * 60 * 60 },
  adapter: PrismaAdapter(db),
} satisfies NextAuthConfig;
