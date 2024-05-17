"use server";

import { db } from "@/lib/db";
import { Gender } from "@prisma/client";
import escapeHtml from "escape-html";
import * as z from "zod";
import { checkAdmin } from "./check-permission";
import { getRooms } from "@/data/room";

export const getListRooms = async () => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  const listRooms = await getRooms();
  return { rooms: listRooms };
};
