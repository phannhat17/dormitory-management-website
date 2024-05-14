import NextAuth, { type DefaultSession } from "next-auth";
import {JWT} from "@auth/core/jwt";
import { UserRole, UserStatus, Gender } from "@prisma/client";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  status: UserStatus;
  gender: Gender;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}


declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
    status: UserStatus;
    gender: Gender;
  }
}