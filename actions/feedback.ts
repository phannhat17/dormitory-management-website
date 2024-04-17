"use server";

import * as z from "zod";
import { FeedbackSchema } from "@/schemas";
import escapeHtml from "escape-html";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const feedback = async (values: z.infer<typeof FeedbackSchema>) => {
  const session = await auth();

  if (!session?.user.id) {
    return { error: "You must be logged in to submit feedback!" };
  }

  const currentUserId = session.user.id;
  const validatedFields = FeedbackSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { feedback } = validatedFields.data;
  const sanitizedDeedback = escapeHtml(feedback);

  await db.feedback.create({
    data: {
      content: sanitizedDeedback,
      userId: currentUserId,
    },
  });
  return { success: "Feedback sent!" };
}