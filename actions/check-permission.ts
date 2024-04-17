"use server";

import { currentRole } from "@/lib/auth";

export const checkAdmin = async () => {
    const isAdmin = await currentRole() === "ADMIN";
    
    return isAdmin;
};
