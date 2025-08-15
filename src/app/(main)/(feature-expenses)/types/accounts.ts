import type { Account, ExpensePayment } from "@prisma/client";

export type AccountWithPayments = Account & {
  Payments: ExpensePayment[];
};
