"use server"

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { RoomStatus } from "@prisma/client";

// Fetch current user info based on session
export const getUserInfo = async () => {
  const session = await currentUser();
  if (!session?.email) {
    return { error: "User not authenticated" };
  }

  const user = await db.user.findUnique({
    where: { email: session.email },
    include: {
      Room: {
        include: {
          Facilities: true,
          Users: true,
        },
      },
    },
  });

  if (!user) {
    return { error: "User not found" };
  }

  return { user };
};

// Fetch available rooms
export const getAvailableRooms = async () => {
  const availableRooms = await db.room.findMany({
    where: {
      status: RoomStatus.AVAILABLE,
      current: { lt: db.room.fields.max },
    },
    include: {
      Facilities: true,
    },
  });

  return { availableRooms };
};

// Request room change
export const requestRoomChange = async (userId: string, toRoomId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const roomChangeRequest = await db.roomChangeRequest.create({
    data: {
      userId: userId,
      fromRoomId: user.currentRoomId,
      toRoomId: toRoomId,
    },
  });

  return { success: "Room change request submitted", roomChangeRequest };
};
