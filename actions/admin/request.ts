"use server";

import { db } from "@/lib/db";
import { RequestStatus, RoomStatus, UserStatus } from "@prisma/client";
import { checkAdmin } from "./check-permission";

export const approveRoomChangeRequest = async (requestId: string) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to approve room change requests!" };
  }

  const request = await db.roomChangeRequest.findUnique({
    where: { id: requestId },
    include: { User: true, ToRoom: true, FromRoom: true },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  if (request.ToRoom.current >= request.ToRoom.max) {
    return { error: "The room is already full" };
  }

  await db.$transaction(async (prisma) => {
    // Delete old contract and invoice
    if (request.userId && request.fromRoomId) {
      await prisma.contract.deleteMany({
        where: { userId: request.userId, roomId: request.fromRoomId },
      });

      await prisma.invoice.deleteMany({
        where: { roomId: request.fromRoomId },
      });
    }
    // Update user room
    await prisma.user.update({
      where: { id: request.userId },
      data: {
        currentRoomId: request.toRoomId,
        status: UserStatus.STAYING,
      },
    });

    // Update new room occupancy
    await prisma.room.update({
      where: { id: request.toRoomId },
      data: { current: { increment: 1 } },
    });

    // Update old room occupancy
    if (request.fromRoomId) {
      await prisma.room.update({
        where: { id: request.fromRoomId },
        data: { current: { decrement: 1 } },
      });
    }

    // Create new contract and invoice
    const newContract = await prisma.contract.create({
      data: {
        contractType: "ROOM",
        userId: request.userId,
        roomId: request.toRoomId,
        term: "MONTHLY",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    });

    await prisma.invoice.create({
      data: {
        roomId: request.toRoomId,
        contractId: newContract.id,
        amountPaid: 0,
        amountDue: request.ToRoom.price,
      },
    });

    // Approve the room change request
    await prisma.roomChangeRequest.update({
      where: { id: request.id },
      data: { status: RequestStatus.APPROVED },
    });

    // Update room status to "full" if current occupants reach max capacity
    const updatedRoom = await prisma.room.findUnique({
      where: { id: request.toRoomId },
      select: { current: true, max: true },
    });

    if (updatedRoom && updatedRoom.current >= updatedRoom.max) {
      await prisma.room.update({
        where: { id: request.toRoomId },
        data: { status: RoomStatus.FULL },
      });
    }
  });

  return { success: "Room change request approved" };
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
