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
import { addMinutes, differenceInMinutes, isBefore } from "date-fns";

// minutes
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15;
const RESET_DURATION = 15;

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

  if (existingUser.password === null) {
    return {
      error:
        "This is your first login attempt. Click forgot password to reset your password",
    };
  }

  if (!existingUser.emailVerified) {
    return {
      error: "Email not verified! Please verify your email address.",
    };
  }

  const now = new Date();

  if (existingUser.status === "BANNED") {
    return { error: "You have been banned!" };
  }

  if (existingUser.lockoutUntil && isBefore(now, existingUser.lockoutUntil)) {
    return {
      error:
        "Account is temporarily locked due to multiple failed login attempts!",
    };
  }

  if (
    existingUser.lastFailedAttempt &&
    differenceInMinutes(now, existingUser.lastFailedAttempt) > RESET_DURATION
  ) {
    await db.user.update({
      where: { id: existingUser.id },
      data: { failedAttempts: 0 },
    });
  }

  if (existingUser.password) {
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      const newFailedAttempts = existingUser.failedAttempts + 1;
      let lockoutUntil = null;

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockoutUntil = addMinutes(now, LOCKOUT_DURATION);
      }

      await db.user.update({
        where: { id: existingUser.id },
        data: {
          failedAttempts: newFailedAttempts,
          lockoutUntil,
          lastFailedAttempt: now,
        },
      });

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        return {
          error:
            "Account is temporarily locked due to multiple failed login attempts!",
        };
      }

      return { error: "Invalid credentials!" };
    } else {
      await db.user.update({
        where: { id: existingUser.id },
        data: {
          failedAttempts: 0,
          lockoutUntil: null,
          lastFailedAttempt: null,
        },
      });
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
