import { db } from "@/lib/db";

export const getTwoFATokenByToken = async (token: string) => {
  try {
    const twoFAToken = await db.twoFAToken.findUnique({
      where: { token },
    });

    return twoFAToken;
  } catch (error) {
    return null;
  }
};

export const getTwoFATokenByEmail = async (email: string) => {
  try {
    const twoFAToken = await db.twoFAToken.findFirst({
      where: { email },
    });

    return twoFAToken;
  } catch (error) {
    return null;
  }
};
