"use server";

import { CreateUserSchema } from "@/schemas";
import * as z from "zod";

export const createContract = async (values: z.infer<typeof CreateUserSchema>) => {
};