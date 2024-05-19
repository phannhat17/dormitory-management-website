"use server";

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import escapeHtml from "escape-html";
import { AuthError } from "next-auth";
import * as z from "zod";
import { generateVerificationToken } from "@/lib/token";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;
  const sanitizedEmail = escapeHtml(email.toLowerCase());

  const existingUser = await getUserByEmail(sanitizedEmail);

  if (!existingUser) {
    return {
      error:
        "User not found! Please register an account or verify your email address",
    };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(sanitizedEmail);
    await sendVerificationEmail(sanitizedEmail, verificationToken.token);

    return {
      error:
        "Email not verified! A new verification email has been sent to your email address.",
    };
  }

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
