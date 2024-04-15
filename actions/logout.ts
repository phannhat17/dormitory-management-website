"use server";

import { signOut } from "@/auth";

export const logout = async () => {
    // Server action
    await signOut();
};
