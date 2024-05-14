"use server";

import * as z from "zod";
import { ResetPassword, ResetFromSchema } from "@/schemas";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { sendPasswordResetEmail } from "@/lib/mail";
import { generatePasswordResetToken } from "@/lib/token";
import { getUserByEmail } from "@/data/user";
import escapeHtml from "escape-html";

export const resetPassword = async (values: z.infer<typeof ResetPassword>) => {
  const session = await auth();

  if (!session?.user.id) {
    return { error: "You must be logged in to submit feedback!" };
  }

  const currentUserId = session.user.id;

  const validatedFields = ResetPassword.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { newPassword, confirmPassword } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(newPassword, 14);

  try {
    await db.user.update({
      where: { id: currentUserId },
      data: { password: hashedPassword },
    });
    return {
      success: "Password successfully updated. You will need to login again!",
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
