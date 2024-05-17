"use server";

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import escapeHtml from "escape-html";
import { AuthError } from "next-auth";
import * as z from "zod";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;
  const sanitizedEmail = escapeHtml(email.toLowerCase());

  try {
    await signIn("credentials", {
      email: sanitizedEmail,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message.includes("BannedUser")) {
        return {
          error: "You have been banned!",
        };
      }
      if (error.message.includes("TemporarilyLocked")) {
        return {
          error:
            "Account is temporarily locked due to multiple failed login attempts!",
        };
      }
      if (error.message.includes("FirstLogin")) {
        return {
          error:
            "This is your first login attempt. Click forgot password to reset your password!",
        };
      }
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "An error occurred!" };
      }
    }

    throw error;
  }
};
