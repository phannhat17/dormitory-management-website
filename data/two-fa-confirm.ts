import { db } from "@/lib/db";

export const getTwoFAConfirmById = async (userId: string) => {
  try {
    const twoFAConfirm = await db.twoFAConfirmation.findUnique({
      where: { userId },
    });

    return twoFAConfirm;
  } catch (error) {
    return null;
  }
};