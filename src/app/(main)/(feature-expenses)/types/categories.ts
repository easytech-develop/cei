import type { Expense, ExpenseCategory } from "@prisma/client";

export type CategoryWithChildren = ExpenseCategory & {
  children: ExpenseCategory[];
  parent?: ExpenseCategory | null;
};

export type CategoryWithExpenses = ExpenseCategory & {
  Expense: Expense[];
};
