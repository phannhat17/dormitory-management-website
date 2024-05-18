import { db } from "@/lib/db";

export const getRooms = async () => {
  const rooms = await db.room.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      status: true,
      gender: true,
      current: true,
      max: true,
      price: true,
    },
  });
  return rooms;
};