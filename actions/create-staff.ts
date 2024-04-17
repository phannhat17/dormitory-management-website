"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { CreateStaffSchema } from "@/schemas";
import { getUserByEmailId } from "@/data/user";
import escapeHtml from "escape-html";

export const createStaff = async (
  values: z.infer<typeof CreateStaffSchema>
) => {
  const validatedFields = CreateStaffSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { staffid, name, email, password } = validatedFields.data;
  const sanitizedStaffId = escapeHtml(staffid);
  const sanitizedName = escapeHtml(name);
  const sanitizedEmail = escapeHtml(email.toLowerCase());

  const existingUser = await getUserByEmailId(sanitizedEmail, sanitizedStaffId);

  if (existingUser) {
    return { error: "Email or Staff ID already in use!" };
  }

  const hashedPassword = await bcrypt.hash(password, 14);

  await db.user.create({
    data: {
      id: sanitizedStaffId,
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  return { success: "Staff Created!" };
};
