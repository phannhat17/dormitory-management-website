"use server";

import { auth } from "@/auth";
import { getAllFeedback } from "@/data/feedback";
import { getTotalUserCount, getUsers } from "@/data/user";
import { checkAdmin } from "./check-permission";

export const getTotalUser = async () => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  const numUser = await getTotalUserCount();

  return numUser;
};

export const getListUsers = async () => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  const listUser = await getUsers();
  const numUser = await getTotalUser();

  if ("error" in numUser) {
    //  error
    console.error(numUser.error);
  } else {
    const totalUsers = numUser.totalUsers;
    return { users: listUser, total: totalUsers };
  }
  
};

export const getListFB = async () => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  const listFB = await getAllFeedback();
  return { feedbacks: listFB };
};
