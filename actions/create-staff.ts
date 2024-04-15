"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { CreateStaffSchema } from "@/schemas";
import { getUserByEmailId } from "@/data/user";

export const createStaff = async (values: z.infer<typeof CreateStaffSchema>) => {
  const validatedFields = CreateStaffSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { staffid, name, email, password } = validatedFields.data;

  const existingUser = await getUserByEmailId(email, staffid);

  if (existingUser) {
    return { error: "Email or Student ID already in use!" };
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  await db.user.create({
    data: {
      id: staffid,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  return { success: "Staff Created!" };
};
