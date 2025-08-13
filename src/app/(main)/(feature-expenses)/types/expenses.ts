import type {
  Account,
  Expense,
  ExpenseAttachment,
  ExpenseCategory,
  ExpenseInstallment,
  ExpenseItem,
  ExpensePayment,
  Vendor,
} from "@prisma/client";

export type ExpenseWithRelations = Expense & {
  Vendor: Vendor;
  Category: ExpenseCategory;
  Items: ExpenseItem[];
  Installments: ExpenseInstallmentWithPayments[];
  Attachments: ExpenseAttachment[];
};

export type ExpenseItemWithExpense = ExpenseItem & {
  Expense: Expense;
};

export type ExpenseInstallmentWithPayments = ExpenseInstallment & {
  Payments: ExpensePaymentWithAccount[];
};

export type ExpensePaymentWithAccount = ExpensePayment & {
  Account: Account;
};

export type ExpensePaymentWithRelations = ExpensePayment & {
  Installment: ExpenseInstallment;
  Account: Account;
};

export type ExpenseAttachmentWithExpense = ExpenseAttachment & {
  Expense: Expense;
};

// Tipos para estatísticas
export type ExpenseStats = {
  totalExpenses: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  overdueCount: number;
};

// Tipos para filtros
export type ExpenseFilters = {
  search?: string;
  status?: "DRAFT" | "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
  vendorId?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
};

export type ExpenseStatsFilters = {
  startDate?: Date;
  endDate?: Date;
  vendorId?: string;
  categoryId?: string;
};
