import type { ExpenseCategory } from "@prisma/client";

export type CategoryWithChildren = ExpenseCategory & {
  children: ExpenseCategory[];
  parent?: ExpenseCategory | null;
};

export type CategoryWithExpenses = ExpenseCategory & {
  Expense: any[];
};
