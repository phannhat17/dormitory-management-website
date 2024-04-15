"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { CreateUserSchema } from "@/schemas";
import { getUserByEmailId } from "@/data/user";

export const createUser = async (values: z.infer<typeof CreateUserSchema>) => {
  const validatedFields = CreateUserSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { studentid, name, email, password } = validatedFields.data;

  const existingUser = await getUserByEmailId(email, studentid);

  if (existingUser) {
    return { error: "Email or Student ID already in use!" };
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  await db.user.create({
    data: {
      id: studentid,
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: "User Created!" };
};
