import "@auth/core/jwt";
import { Gender, UserRole, UserStatus } from "@prisma/client";
import { type DefaultSession } from "next-auth";

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