"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { CreateUserSchema } from "@/schemas";
import escapeHtml from "escape-html";
import { checkAdmin } from "./check-permission";
import { Gender } from "@prisma/client";

export const createUser = async (values: z.infer<typeof CreateUserSchema>) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to create user!" };
  }

  const validatedFields = CreateUserSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { students } = validatedFields.data;

  // Sanitize and prepare student data
  const sanitizedStudents = await Promise.all(
    students.map(async (student) => {
      const { studentid, name, email, gender } = student;
      const sanitizedStudentId = escapeHtml(studentid);
      const sanitizedName = escapeHtml(name);
      const sanitizedEmail = escapeHtml(email.toLowerCase());
      const sanitizedGender = escapeHtml(gender);

      return {
        id: sanitizedStudentId,
        name: sanitizedName,
        email: sanitizedEmail,
        gender: sanitizedGender as Gender,
      };
    })
  );

  try {
    const result = await db.user.createMany({
      data: sanitizedStudents,
      skipDuplicates: true,
    });

    const createdCount = result.count;
    const totalCount = sanitizedStudents.length;

    if (createdCount < totalCount) {
      return {
        success: `Created ${createdCount} out of ${totalCount} users. Some users were skipped due to duplicate IDs or emails.`,
      };
    }

    return { success: "All users created successfully!" };
  } catch (error) {
    return { error: `Error creating users: ${(error as Error).message}` };
  }
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

export const getUserInfo = async (id: string) => {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      currentRoomId: true,
      amountPaid: true,
      amountDue: true,
      status: true,
      password: true,
      gender: true,
    },
  });

  if (user) {
    return user;
  }

  return null;
};
