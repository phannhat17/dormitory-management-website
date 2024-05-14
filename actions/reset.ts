"use server";

import * as z from "zod";
import {
  ResetPassword,
  ResetFromSchema,
  ResetPasswordLoggedIn,
} from "@/schemas";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/token";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail, getUserById } from "@/data/user";
import escapeHtml from "escape-html";

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
    return { error: "You must be logged in to submit feedback!" };
  }
  const user = await getUserById(session.user.id);
  if (!user) return { error: "Cannot found user!" };

  const validatedFields = ResetPasswordLoggedIn.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { oldPassword, newPassword } = validatedFields.data;
  const passwordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!passwordMatch) {
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
    console.error("Failed to update password:", error);
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
