"use server";

import { getUserCount } from "@/data/user";

export const getNumUser = async () => {
  const numUser = await getUserCount();

  return { numUser: numUser };
};
