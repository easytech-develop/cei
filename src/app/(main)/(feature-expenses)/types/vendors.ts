import type { Vendor } from "@prisma/client";

export type VendorWithExpenses = Vendor & {
  Expenses: any[];
};
