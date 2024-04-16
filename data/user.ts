import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

export const getUserByEmailId = async (email: string, id: string) => {
  try {
    const user = await db.user.findFirst({
      where: {
        OR: [{ email: email }, { id: id }],
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getTotalUserCount = async () => {
  const count = await db.user.count();
  return count;
};

export const getUsers = async (page: number, limit: number = 30) => {
  const users = await db.user.findMany({
    skip: page * limit,
    take: limit,
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });
  return users;
};