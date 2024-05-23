"use server";

import { db } from "@/lib/db";
import { CreateUserSchema } from "@/schemas";
import { Gender, RoomStatus, UserRole, UserStatus } from "@prisma/client";
import escapeHtml from "escape-html";
import * as z from "zod";
import { checkAdmin } from "./check-permission";

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
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

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

export const getUsers = async () => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to create user!" };
  }

  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
      },
    });
    return { users };
  } catch (error) {
    return { error: "Failed to fetch users" };
  }
};

export const updateUserStatus = async (userId: string, status: UserStatus) => {
    try {
        await db.user.update({
            where: { id: userId },
            data: { status },
        });
        return { success: "User status updated successfully" };
    } catch (error) {
        return { error: "Failed to update user status" };
    }
};

export const updateUser = async (data: {
  id: string;
  newId: string;
  name: string;
  email: string;
  role: UserRole;
  currentRoomId: string | null;
  amountPaid: number;
  amountDue: number;
}) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to update user information!" };
  }

  try {
    if (data.currentRoomId) {
      const room = await db.room.findUnique({
        where: { id: data.currentRoomId },
        select: { gender: true, current: true, max: true },
      });

      if (!room) {
        return { error: "Room not found!" };
      }

      if (room.current >= room.max) {
        return { error: "Room is full!" };
      }

      const user = await db.user.findUnique({
        where: { id: data.id },
        select: { gender: true },
      });

      if (!user) {
        return { error: "User not found!" };
      }

      if (room.gender !== user.gender) {
        return { error: "User's gender does not match the room's gender." };
      }
    }

    const updatedUser = await db.user.update({
      where: { id: data.id },
      data: {
        id: data.newId,
        name: data.name,
        email: data.email,
        role: data.role,
        currentRoomId: data.currentRoomId,
        amountPaid: data.amountPaid,
        amountDue: data.amountDue,
      },
    });

    // Update room's current user count and status
    if (data.currentRoomId) {
      const room = await db.room.findUnique({
        where: { id: data.currentRoomId },
      });

      if (room) {
        const currentCount = await db.user.count({
          where: { currentRoomId: data.currentRoomId },
        });

        await db.room.update({
          where: { id: data.currentRoomId },
          data: {
            current: currentCount,
            status: currentCount >= room.max ? RoomStatus.FULL : RoomStatus.AVAILABLE,
          },
        });
      }
    }

    return { success: "User updated successfully", user: updatedUser };
  } catch (error) {
    return { error: "Failed to update user" };
  }
};


