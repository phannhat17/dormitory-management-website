"use server";

import { getAllFeedback } from "@/data/feedback";
import { getTotalUserCount, getUsers } from "@/data/user";

export const getTotalUser = async () => {
  const numUser = await getTotalUserCount();

  return numUser;
};

export const getListUsers = async () => {
  const listUser = await getUsers();
  const numUser = await getTotalUser().then((res) => res.totalUsers);
  return { users: listUser, total: numUser };
};


export const getListFB = async () => {
  const listFB = await getAllFeedback();
  return { feedbacks: listFB };
};