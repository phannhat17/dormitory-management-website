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

export const getUserCount = async () => {
  try {
    const count = await db.user.count();
    console.log(count);
    return count;
  } catch  {
    return null; 
  }
};

