"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { CreateUserSchema } from "@/schemas";
import { getUserByEmailId } from "@/data/user";
import escapeHtml from "escape-html";

export const createUser = async (values: z.infer<typeof CreateUserSchema>) => {
  const validatedFields = CreateUserSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { studentid, name, email, password } = validatedFields.data;

  const sanitizedStudentId = escapeHtml(studentid);
  const sanitizedName = escapeHtml(name);
  const sanitizedEmail = escapeHtml(email.toLowerCase());

  const existingUser = await getUserByEmailId(
    sanitizedEmail,
    sanitizedStudentId
  );

  if (existingUser) {
    return { error: "Email or Student ID already in use!" };
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  await db.user.create({
    data: {
      id: sanitizedStudentId,
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
    },
  });

  return { success: "User Created!" };
};
