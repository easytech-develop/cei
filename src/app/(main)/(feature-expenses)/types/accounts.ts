import type { Account } from "@prisma/client";

export type AccountWithPayments = Account & {
  Payments: any[];
};
