"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { RoomStatus, Gender } from "@prisma/client";

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
  const session = await currentUser();
  if (!session?.email) {
    return { error: "User not authenticated" };
  }

  const user = await db.user.findUnique({
    where: { email: session.email },
    select: { gender: true },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const availableRooms = await db.room.findMany({
    where: {
      status: RoomStatus.AVAILABLE,
      current: { lt: db.room.fields.max },
      gender: user.gender as Gender,
    },
    include: {
      Facilities: true,
    },
  });

  return { availableRooms };
};

// Request room change
export const requestRoomChange = async (toRoomId: string) => {
  const session = await currentUser();
  if (!session?.email) {
    return { error: "User not authenticated" };
  }

  const user = await db.user.findUnique({
    where: { email: session.email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const existingRequest = await db.roomChangeRequest.findFirst({
    where: {
      userId: user.id,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    return { error: "You already have a pending request" };
  }

  const roomChangeRequest = await db.roomChangeRequest.create({
    data: {
      userId: user.id,
      fromRoomId: user.currentRoomId,
      toRoomId: toRoomId,
    },
  });

  return { success: "Room change request submitted", roomChangeRequest };
};
