"use server";

import { getUserByEmailId } from "@/data/user";
import { RegisterSchema } from "@/schemas";
import escapeHtml from "escape-html";
import * as z from "zod";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { id, name, gender, email, password } = validatedFields.data;
  const sanitizedEmail = escapeHtml(email.toLowerCase());
  const sanitizedId = escapeHtml(id);
  const sanitizedName = escapeHtml(name);
  const hashedPassword = await bcrypt.hash(password, 14);

  const existingUser = await getUserByEmailId(sanitizedEmail, sanitizedId);

  if (existingUser) {
    return { error: "User with the same email or ID already exists!" };
  }

  try {
    await db.user.create({
      data: {
        id: sanitizedId,
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        gender: gender,
        role: "STUDENT",
      },
    });

    const verificationToken = await generateVerificationToken(sanitizedEmail);
    await sendVerificationEmail(sanitizedEmail, verificationToken.token);

    return { success: "Confirm email sent!" };
  } catch (error) {
    return { error: "An error occurred during registration!" };
  }
};
