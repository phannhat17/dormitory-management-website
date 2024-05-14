"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { CreateUserSchema } from "@/schemas";
import escapeHtml from "escape-html";
import { checkAdmin } from "./check-permission";

export const createContract = async (values: z.infer<typeof CreateUserSchema>) => {
};