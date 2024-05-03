"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { CreateUserSchema } from "@/schemas";
import { getUserByEmailId } from "@/data/user";
import { getUserById } from "@/data/user";
import escapeHtml from "escape-html";
import { checkAdmin } from "./check-permission";
import { User } from "@prisma/client";



export const createUser = async (values: z.infer<typeof CreateUserSchema>) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to create user!" };
  }

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


export const deleteUser = async (id: string) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to delete user!" };
  }

  await db.user.delete({
    where: {
      id: id,
    },
  });

  return { success: "User deleted successfully" };
};

interface UserWithFeedbackCount extends User {
  feedbackCount: number;
  password: string;
}

export const getUserInfo = async (id: string): Promise<UserWithFeedbackCount | null> => {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      currentRoomId: true,
      amountPaid: true,
      amountDue: true,
      status: true,
      password: true,
    },
  });

  if (user) {
    const feedbackCount = await db.feedback.count({
      where: {
        userId: id,
      },
    });
    const userWithFeedbackCount: UserWithFeedbackCount = {
      ...user,
      feedbackCount,
    };
    return userWithFeedbackCount;
  }

  return null;
};
