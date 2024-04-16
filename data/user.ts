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
  const totalUsers = await db.user.count();

  const studentCount = await db.user.count({
    where: { role: "STUDENT" },
  });

  const adminCount = await db.user.count({
    where: { role: "ADMIN" },
  });

  const stayingCount = await db.user.count({
    where: { status: "STAYING" },
  });

  const notStayingCount = await db.user.count({
    where: { status: "NOT_STAYING" },
  });

  const bannedCount = await db.user.count({
    where: { status: "BANNED" },
  });

  return {
    totalUsers: totalUsers,
    studentCount: studentCount,
    adminCount: adminCount,
    stayingCount: stayingCount,
    notStayingCount: notStayingCount,
    bannedCount: bannedCount,
  };
};

export const getUsers = async (page: number, limit: number = 10) => {
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