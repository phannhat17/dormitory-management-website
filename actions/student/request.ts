"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { RequestStatus } from "@prisma/client";

// Fetch room change requests for the current user
export const getRoomChangeRequests = async () => {
  const session = await currentUser();
  if (!session?.email) {
    return { error: "User not authenticated" };
  }

  const user = await db.user.findUnique({
    where: { email: session.email },
    select: { id: true },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const requests = await db.roomChangeRequest.findMany({
    where: { userId: user.id },
  });

  return { requests };
};

// Delete a room change request
export const deleteRoomChangeRequest = async (requestId: string) => {
  const session = await currentUser();
  if (!session?.email) {
    return { error: "User not authenticated" };
  }

  const user = await db.user.findUnique({
    where: { email: session.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const request = await db.roomChangeRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  if (request.userId !== user.id && user.role !== "ADMIN") {
    return { error: "You do not have permission to delete this request" };
  }

  if (request.status !== RequestStatus.PENDING) {
    return { error: "Only pending requests can be deleted" };
  }

  await db.roomChangeRequest.delete({
    where: { id: requestId },
  });

  return { success: "Request deleted" };
};
