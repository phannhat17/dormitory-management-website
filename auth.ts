import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
});
