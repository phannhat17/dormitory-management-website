"use server";

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import escapeHtml from "escape-html";
import { AuthError } from "next-auth";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { generateTwoFAToken } from "@/lib/token";
import { getUserByEmail } from "@/data/user";
import { sendTwoFATokenEmail } from "@/lib/mail";
import { getTwoFATokenByEmail } from "@/data/two-fa-token";
import { db } from "@/lib/db";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;
  const sanitizedEmail = escapeHtml(email.toLowerCase());

  const existingUser = await getUserByEmail(sanitizedEmail);

  if (!existingUser?.email) {
    return {
      error:
        "User not found! Please register an account or verify your email address",
    };
  }

  if (!existingUser.emailVerified) {
    return {
      error: "Email not verified! Please verify your email address.",
    };
  }

  // Check password
  if (existingUser.password) {
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return { error: "Invalid credentials!" };
    }
  } 

  if (existingUser.twoFA) {
    if (code) {
      const twoFAToken = await getTwoFATokenByEmail(existingUser.email);

      if (!twoFAToken || twoFAToken.token !== code) {
        return { error: "Invalid two-factor authentication token!" };
      }

      const hasExpired = new Date() > new Date(twoFAToken.expires);

      if (hasExpired) {
        return { error: "Token has expired!" };
      }

      await db.twoFAToken.delete({
        where: { id: twoFAToken.id },
      });
    } else {
      const twoFAToken = await generateTwoFAToken(existingUser.email);

      await sendTwoFATokenEmail(twoFAToken.email, twoFAToken.token);

      return { twoFA: true };
    }
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
