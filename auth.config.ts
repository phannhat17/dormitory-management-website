import { getUserByEmail, getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { LoginSchema } from "@/schemas";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthError, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export default {
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email } = validatedFields.data;

          const user = await getUserByEmail(email);
          return user;
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
      if (!existingUser.emailVerified) return false;

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

      if (existingUser.status === "BANNED") {
        token.status = "BANNED";
      } else {
        token.role = existingUser.role;
        token.status = existingUser.status;
        token.gender = existingUser.gender;
      }

      return token;
    },
  },
  session: { strategy: "jwt", maxAge: 60 * 60 },
  jwt: { maxAge: 60 * 60 },
  adapter: PrismaAdapter(db),
} satisfies NextAuthConfig;
