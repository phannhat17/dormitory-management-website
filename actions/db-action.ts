"use server";

import { getAllFeedback } from "@/data/feedback";
import { getTotalUserCount, getUsers } from "@/data/user";
import { auth } from "@/auth";

export const getTotalUser = async () => {
  const numUser = await getTotalUserCount();

  return numUser;
};

export const getListUsers = async () => {
    const session = await auth();

    if (!session?.user.id) {
      return { error: "You must be logged in to submit feedback!" };
    }

  const listUser = await getUsers();
  const numUser = await getTotalUser().then((res) => res.totalUsers);
  return { users: listUser, total: numUser };
};

export const getListFB = async () => {
  const session = await auth();

  if (!session?.user.id) {
    return { error: "You must be logged in to submit feedback!" };
  }

  const listFB = await getAllFeedback();
  return { feedbacks: listFB };
};