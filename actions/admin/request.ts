"use server";

import { db } from "@/lib/db";
import { RequestStatus, RoomStatus, UserStatus } from "@prisma/client";
import { checkAdmin } from "./check-permission";

// Function to approve a room change request
export const approveRoomChangeRequest = async (requestId: string) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to approve room change requests!" };
  }

  const request = await db.roomChangeRequest.findUnique({
    where: { id: requestId },
    include: { ToRoom: true, FromRoom: true, User: true },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  if (request.status !== RequestStatus.PENDING) {
    return { error: "Only pending requests can be approved" };
  }

  if (!request.ToRoom) {
    return { error: "Destination room not found" };
  }

  if (request.ToRoom.current >= request.ToRoom.max) {
    return { error: "The room is already full" };
  }

  const transaction = await db.$transaction(async (prisma) => {
    const updatedToRoom = await prisma.room.update({
      where: { id: request.toRoomId },
      data: {
        current: { increment: 1 },
        status:
          request.ToRoom.current + 1 >= request.ToRoom.max
            ? RoomStatus.FULL
            : RoomStatus.AVAILABLE,
      },
    });

    if (request.fromRoomId) {
      await prisma.room.update({
        where: { id: request.fromRoomId },
        data: {
          current: { decrement: 1 },
          status: RoomStatus.AVAILABLE,
        },
      });
    }

    await prisma.user.update({
      where: { id: request.userId },
      data: {
        currentRoomId: request.toRoomId,
        status: UserStatus.STAYING,
      },
    });

    await prisma.roomChangeRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.APPROVED },
    });

    return updatedToRoom;
  });

  return { success: "Request approved successfully", transaction };
};

// Function to reject a room change request
export const rejectRoomChangeRequest = async (requestId: string) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to reject room change requests!" };
  }

  const request = await db.roomChangeRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  if (request.status !== RequestStatus.PENDING) {
    return { error: "Only pending requests can be rejected" };
  }

  await db.roomChangeRequest.update({
    where: { id: requestId },
    data: { status: RequestStatus.REJECTED },
  });

  return { success: "Request rejected successfully" };
};

export const getRoomChangeRequests = async () => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to view room change requests!" };
  }

  const requests = await db.roomChangeRequest.findMany({
    include: { ToRoom: true, FromRoom: true, User: true },
  });

  return { requests };
};