import type { Expense, Vendor } from "@prisma/client";

export type VendorWithExpenses = Vendor & {
  Expenses: Expense[];
};
