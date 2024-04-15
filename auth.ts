import NextAuth, { AuthError } from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "@/data/user";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
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
      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      token.role = existingUser.role;
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
