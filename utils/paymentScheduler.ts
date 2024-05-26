// utils/paymentScheduler.ts

import { db } from "@/lib/db";

export const schedulePayments = async () => {
  const contracts = await db.contract.findMany({
    include: {
      Room: true,
      User: true,
    },
  });

  for (const contract of contracts) {
    const amountDue = contract.Room.price;

    await db.invoice.create({
      data: {
        roomId: contract.roomId,
        contractId: contract.id,
        amountPaid: 0,
        amountDue: amountDue,
      },
    });
  }
};
