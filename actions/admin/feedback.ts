"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { FeedbackSchema } from "@/schemas";
import escapeHtml from "escape-html";
import * as z from "zod";
import { checkAdmin } from "./check-permission";
import { verifyRecaptcha } from "../auth/verifyRecaptcha";

export const feedback = async (values: z.infer<typeof FeedbackSchema>) => {
  const session = await auth();

  if (!session?.user.id) {
    return { error: "You must be logged in to submit feedback!" };
  }

  const validatedFields = FeedbackSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { feedback, recaptchaToken } = validatedFields.data;
  const sanitizedDeedback = escapeHtml(feedback);
  // Always verify the CAPTCHA token
  if (!recaptchaToken) {
    return { error: "reCAPTCHA token is required" };
  }

  // Validate reCAPTCHA token server-side
  const recaptchaValidation = await verifyRecaptcha(recaptchaToken);
  
  if (!recaptchaValidation.success) {
    return { error: "reCAPTCHA validation failed." };
  }
  const currentUserId = session.user.id;

  await db.feedback.create({
    data: {
      content: sanitizedDeedback,
      userId: currentUserId,
    },
  });
  return { success: "Feedback sent!" };
};

export const deleteFeedback = async (id: number) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to delete feedback!" };
  }

  await db.feedback.delete({
    where: {
      id: id,
    },
  });

  return { success: "Feedback deleted successfully" };
};

export const getFbInfo = async (id: string) => {
  const isAdmin = await checkAdmin();

  if (!isAdmin) {
    return { error: "You must be an admin to do this action!" };
  }

  const feedback = await db.feedback.findUnique({
    where: { id: parseInt(id) },
    include: { User: true },
  });

  if (feedback) {
    return feedback;
  }

  return { error: "Feedback not found!" };
};
