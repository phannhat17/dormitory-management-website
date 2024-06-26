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
    const errorDetails = validatedFields.error.format();
    console.log(JSON.stringify(errorDetails, null, 2));
    return { error: "Invalid fields!", details: errorDetails };
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
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to create user!" };
  }
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
    const user = await db.user.findUnique({
      where: { id: data.id },
      select: { currentRoomId: true, gender: true },
    });

    if (!user) {
      return { error: "User not found!" };
    }

    const previousRoomId = user.currentRoomId;
    const newRoomId = data.currentRoomId;

    if (newRoomId) {
      const room = await db.room.findUnique({
        where: { id: newRoomId },
        select: { gender: true, current: true, max: true },
      });

      if (!room) {
        return { error: "Room not found!" };
      }

      if (room.current >= room.max) {
        return { error: "Room is full!" };
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
        currentRoomId: newRoomId,
        amountPaid: data.amountPaid,
        amountDue: data.amountDue,
        status: newRoomId ? UserStatus.STAYING : UserStatus.NOT_STAYING,
      },
    });

    // Update the previous room's current count and status if the user is leaving that room
    if (previousRoomId && previousRoomId !== newRoomId) {
      const previousRoom = await db.room.findUnique({
        where: { id: previousRoomId },
      });

      if (previousRoom) {
        const previousRoomCurrentCount = await db.user.count({
          where: { currentRoomId: previousRoomId },
        });

        await db.room.update({
          where: { id: previousRoomId },
          data: {
            current: previousRoomCurrentCount,
            status:
              previousRoomCurrentCount === previousRoom.max
                ? RoomStatus.FULL
                : RoomStatus.AVAILABLE,
          },
        });
      }
    }

    // Update the new room's current count and status if the user is moving to a new room
    if (newRoomId) {
      const newRoom = await db.room.findUnique({
        where: { id: newRoomId },
      });

      if (newRoom) {
        const newRoomCurrentCount = await db.user.count({
          where: { currentRoomId: newRoomId },
        });

        await db.room.update({
          where: { id: newRoomId },
          data: {
            current: newRoomCurrentCount,
            status:
              newRoomCurrentCount === newRoom.max
                ? RoomStatus.FULL
                : RoomStatus.AVAILABLE,
          },
        });
      }
    }

    return { success: "User updated successfully", user: updatedUser };
  } catch (error) {
    return { error: "Failed to update user" };
  }
};

export const banUser = async (userId: string) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to ban user!" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { currentRoomId: true },
    });

    if (!user) {
      return { error: "User not found!" };
    }

    const currentRoomId = user.currentRoomId;

    await db.$transaction(async (prisma) => {
      if (currentRoomId) {
        await prisma.room.update({
          where: { id: currentRoomId },
          data: { current: { decrement: 1 } },
        });

        const updatedRoom = await prisma.room.findUnique({
          where: { id: currentRoomId },
          select: { current: true, max: true },
        });

        if (updatedRoom && updatedRoom.current < updatedRoom.max) {
          await prisma.room.update({
            where: { id: currentRoomId },
            data: { status: RoomStatus.AVAILABLE },
          });
        }

        const contracts = await prisma.contract.findMany({
          where: { userId },
        });

        const contractIds = contracts.map((contract) => contract.id);

        await prisma.invoice.deleteMany({
          where: { contractId: { in: contractIds } },
        });

        await prisma.contract.deleteMany({
          where: { id: { in: contractIds } },
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { status: UserStatus.BANNED },
      });
    });

    return { success: "User banned successfully" };
  } catch (error) {
    return { error: "Failed to ban user" };
  }
};

export const unbanUser = async (userId: string) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to unban user!" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { status: UserStatus.NOT_STAYING },
    });

    return { success: "User unbanned successfully" };
  } catch (error) {
    return { error: "Failed to unban user" };
  }
};