"use server";

import { db } from "@/lib/db";
import { Gender, RoomStatus } from "@prisma/client";
import escapeHtml from "escape-html";
import * as z from "zod";
import { checkAdmin } from "./check-permission";
import { getRooms } from "@/data/room";
import { updateRoomSchema } from "@/schemas";

export const getListRooms = async () => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  const listRooms = await getRooms();
  return { rooms: listRooms };
};

export const getRoomInfo = async (id: string) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  const room = await db.room.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      gender: true,
      price: true,
      max: true,
      Facilities: {
        select: {
          id: true,
          status: true,
          price: true,
        },
      },
      Users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (room) {
    return room;
  }

  return null;
};

export const deleteRoom = async (id: string) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to delete room!" };
  }

  try {
    await db.user.updateMany({
      where: { currentRoomId: id },
      data: { currentRoomId: null },
    });

    await db.room.delete({
      where: {
        id: id,
      },
    });

    return { success: "Room deleted successfully" };
  } catch (error) {
    return { error: "Failed to delete room" };
  }
};

export const updateRoom = async (data: z.infer<typeof updateRoomSchema>) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to update a room!" };
  }

  const validatedData = updateRoomSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: "Invalid input data" };
  }

  const { originalId, newId, gender, price, facilities, users } =
    validatedData.data;

  try {
    const existingRoom = await db.room.findUnique({
      where: { id: originalId },
    });
    if (!existingRoom) {
      return { error: "Room not found" };
    }

    if (originalId !== newId) {
      const newIdRoom = await db.room.findUnique({ where: { id: newId } });
      if (newIdRoom) {
        return { error: "New room ID already exists" };
      }
    }

    if (users.length > existingRoom.max) {
      return {
        error: "The number of users exceeds the maximum room capacity.",
      };
    }

    const genderMismatchUsers = await db.user.findMany({
      where: {
        id: { in: users },
        gender: { not: gender },
      },
    });

    if (genderMismatchUsers.length > 0) {
      return { error: "Some users' gender does not match the room's gender." };
    }

    const userTransfers = await Promise.all(
      users.map(async (userId) => {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { currentRoomId: true },
        });

        if (user && user.currentRoomId && user.currentRoomId !== originalId) {
          return {
            userId,
            fromRoomId: user.currentRoomId,
            toRoomId: originalId,
          };
        }
        return null;
      })
    );

    const userTransferInfo = userTransfers.filter(
      (transfer) => transfer !== null
    );

    if (userTransferInfo.length > 0) {
      return {
        error: "Some users are already assigned to other rooms.",
        transfers: userTransferInfo,
      };
    }

    const roomStatus =
      users.length === existingRoom.max
        ? RoomStatus.FULL
        : RoomStatus.AVAILABLE;

    const updatedRoom = await db.room.update({
      where: { id: originalId },
      data: {
        id: newId,
        gender,
        price,
        status: roomStatus,
        current: users.length,
        Facilities: {
          set: facilities.map((facilityId) => ({ id: Number(facilityId) })),
        },
        Users: {
          set: users.map((userId) => ({ id: userId })),
        },
      },
    });

    return { success: "Room updated successfully", room: updatedRoom };
  } catch (error) {
    return { error: "Failed to update room" };
  }
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