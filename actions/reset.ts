"use server";

import { auth, signOut } from "@/auth";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail, getUserById } from "@/data/user";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/token";
import {
    ResetFromSchema,
    ResetPassword,
    ResetPasswordLoggedIn,
} from "@/schemas";
import bcrypt from "bcryptjs";
import { addMinutes, differenceInMinutes, isBefore } from "date-fns";
import escapeHtml from "escape-html";
import * as z from "zod";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 10;
const RESET_DURATION = 3;

export const forgotPassword = async (
  values: z.infer<typeof ResetPassword>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = ResetPassword.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken) {
    return { error: "Invalid token!" };
  }

  const hasExpired = new Date() > new Date(existingToken.expires);
  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  const { newPassword } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(newPassword, 14);
  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });
  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password successfully updated!" };
};

export const resetPassword = async (
  values: z.infer<typeof ResetPasswordLoggedIn>
) => {
  const session = await auth();

  if (!session?.user.id) {
    return { error: "You must be logged in to change password!" };
  }
  const user = await getUserById(session.user.id);
  if (!user) return { error: "Cannot found user!" };

  const now = new Date();

  if (user.lockoutUntil && isBefore(now, user.lockoutUntil)) {
    return {
      error:
        "Your account is temporarily locked due to multiple failed attempts.",
    };
  }   

  if (
    user.lastFailedAttempt &&
    differenceInMinutes(now, user.lastFailedAttempt) > RESET_DURATION
  ) {
    await db.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0 },
    });
  }

  const validatedFields = ResetPasswordLoggedIn.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { oldPassword, newPassword } = validatedFields.data;
  const passwordMatch =
    user.password && (await bcrypt.compare(oldPassword, user.password));

  if (!passwordMatch) {
    const newFailedAttempts = user.failedAttempts + 1;
    let lockoutUntil = null;

    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      lockoutUntil = addMinutes(now, LOCKOUT_DURATION);
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: newFailedAttempts,
        lockoutUntil,
        lastFailedAttempt: now,
      },
    });

    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      await signOut();
    }

    return { error: "Wrong current password!" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 14);

  try {
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    return {
      success: "Password successfully updated.",
    };
  } catch (error) {
    return { error: "Failed to update password." };
  }
};

export const reset = async (values: z.infer<typeof ResetFromSchema>) => {
  const validatedFields = ResetFromSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }

  const { email } = validatedFields.data;
  const sanitizedEmail = escapeHtml(email.toLowerCase());
  const existingUser = await getUserByEmail(sanitizedEmail);

  if (!existingUser) {
    return { error: "Email not found!" };
  }

  const passwordResetToken = await generatePasswordResetToken(sanitizedEmail);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { sucess: "Password reset email sent!" };
};
