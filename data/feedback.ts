import { db } from "@/lib/db";

export async function getAllFeedback() {
  const feedbacks = await db.feedback.findMany({
    include: {
      User: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return feedbacks.map((feedback) => ({
    id: feedback.id,
    userId: feedback.User.id,
    userName: feedback.User.name,
    content: feedback.content,
    createdAt: feedback.createdAt,
  }));
}
