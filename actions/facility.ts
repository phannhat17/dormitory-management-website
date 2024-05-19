"use server";

import { db } from "@/lib/db";
import escapeHtml from "escape-html";
import * as z from "zod";
import { checkAdmin } from "./check-permission";
import { UpdateFacilitySchema, CreateFacilitySchema } from "@/schemas";

export const createFacility = async (
  data: z.infer<typeof CreateFacilitySchema>
) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  const validation = CreateFacilitySchema.safeParse(data);
  if (!validation.success) {
    return { error: "Invalid input data" };
  }

  const { name, number, status, currentRoomId, price } = validation.data;

  try {
    const facility = await db.facility.create({
      data: {
        name: escapeHtml(name),
        number: number,
        status: escapeHtml(status),
        currentRoomId: escapeHtml(currentRoomId),
        price: price,
      },
    });

    return { success: "Facility created successfully", facility };
  } catch (error) {
    console.log(error);
    return { error: "Failed to create facility" };
  }
};

export const addFacilityToRoom = async (roomId: string, facilityId: number) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  try {
    const updatedFacility = await db.facility.update({
      where: { id: facilityId },
      data: { currentRoomId: roomId },
    });

    return {
      success: "Facility added to room successfully",
      facility: updatedFacility,
    };
  } catch (error) {
    return { error: "Failed to add facility to room" };
  }
};

export const updateFacility = async (
  data: z.infer<typeof UpdateFacilitySchema>
) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  const validation = UpdateFacilitySchema.safeParse(data);
  if (!validation.success) {
    return { error: "Invalid input data" };
  }

  const { name, number, status, price } = validation.data;

  try {
    const updatedFacility = await db.facility.update({
      where: { id: data.id },
      data: {
        name: escapeHtml(name),
        number: number,
        status: escapeHtml(status),
        price: price,
      },
    });

    return {
      success: "Facility updated successfully",
      facility: updatedFacility,
    };
  } catch (error) {
    return { error: "Failed to update facility" };
  }
};
