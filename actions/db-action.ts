"use server";

import { getTotalUserCount, getUsers } from "@/data/user";

export const getTotalUser = async () => {
  const numUser = await getTotalUserCount();

  return { numUser: numUser };
};

export const getListUsers = async (page: number) => {
  const listUser = await getUsers(page);
  const numUser = await getTotalUserCount();
  return { users: listUser, total: numUser };
};
