"use server";

import { getTotalUserCount, getUsers } from "@/data/user";

export const getTotalUser = async () => {
  const numUser = await getTotalUserCount();

  return numUser;
};

export const getListUsers = async (page: number) => {
  const listUser = await getUsers(page);
  const numUser = await getTotalUser().then((res) => res.totalUsers);
  return { users: listUser, total: numUser };
};
