import { z } from "zod";

// Schema para item de despesa
export const expenseItemSchema = z.object({
  name: z.string().min(1, "Nome do item é obrigatório"),
  quantity: z.number().positive("Quantidade deve ser positiva"),
  unitPrice: z.number().positive("Preço unitário deve ser positivo"),
  discount: z.number().min(0, "Desconto não pode ser negativo").default(0),
  total: z.number().positive("Total deve ser positivo"),
});

// Schema para parcela de despesa
export const expenseInstallmentSchema = z.object({
  number: z.number().int().positive("Número da parcela deve ser positivo"),
  dueDate: z.date(),
  amount: z.number().positive("Valor da parcela deve ser positivo"),
  status: z.enum(["PENDING", "PARTIAL", "PAID", "CANCELLED"]).default("PENDING"),
});

// Schema para pagamento
export const expensePaymentSchema = z.object({
  installmentId: z.string().uuid("ID da parcela deve ser um UUID válido"),
  paidAt: z.date(),
  amount: z.number().positive("Valor do pagamento deve ser positivo"),
  accountId: z.string().uuid("ID da conta deve ser um UUID válido"),
  paymentMethod: z.enum(["PIX", "TED", "DOC", "BOLETO", "CARTAO_CREDITO", "CARTAO_DEBITO", "DINHEIRO", "CHEQUE"]),
  note: z.string().optional(),
});

// Schema para anexo
export const expenseAttachmentSchema = z.object({
  expenseId: z.string().uuid("ID da despesa deve ser um UUID válido"),
  fileKey: z.string().min(1, "Chave do arquivo é obrigatória"),
  fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
  mimeType: z.string().optional(),
  size: z.number().positive("Tamanho do arquivo deve ser positivo").optional(),
});

// Schema para criação de despesa
export const createExpenseSchema = z.object({
  vendorId: z.string().nonempty("Fornecedor é obrigatório"),
  categoryId: z.string().nonempty("Categoria é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  competenceDate: z.date(),
  issueDate: z.date().optional(),
  totalNet: z.number().positive("Valor total deve ser positivo"),
  status: z.enum(["DRAFT", "OPEN", "PARTIALLY_PAID", "PAID", "CANCELLED"]).default("DRAFT"),
  items: z.array(expenseItemSchema).min(1, "Pelo menos um item é obrigatório"),
  installments: z.array(expenseInstallmentSchema).min(1, "Pelo menos uma parcela é obrigatória"),
});

// Schema para atualização de despesa
export const updateExpenseSchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  vendorId: z.string().nonempty("Fornecedor é obrigatório"),
  categoryId: z.string().nonempty("Categoria é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  competenceDate: z.date(),
  issueDate: z.date().optional(),
  totalNet: z.number().positive("Valor total deve ser positivo"),
  status: z.enum(["DRAFT", "OPEN", "PARTIALLY_PAID", "PAID", "CANCELLED"]),
  items: z.array(expenseItemSchema).min(1, "Pelo menos um item é obrigatório"),
  installments: z.array(expenseInstallmentSchema).min(1, "Pelo menos uma parcela é obrigatória"),
});

// Schema para resposta de despesa
export const expenseResponseSchema = z.object({
  id: z.string().uuid(),
  vendorId: z.string().uuid(),
  categoryId: z.string().uuid(),
  description: z.string(),
  competenceDate: z.date(),
  issueDate: z.date().nullable(),
  totalNet: z.number(),
  status: z.enum(["DRAFT", "OPEN", "PARTIALLY_PAID", "PAID", "CANCELLED"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para listagem de despesas
export const listExpensesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "PARTIALLY_PAID", "PAID", "CANCELLED"]).optional(),
  vendorId: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  sortBy: z.enum(["description", "competenceDate", "totalNet", "status", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema para filtros de estatísticas
export const expenseStatsSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  vendorId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

// Tipos derivados dos schemas
export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>;
export type ExpenseResponse = z.infer<typeof expenseResponseSchema>;
export type ListExpensesSchema = z.infer<typeof listExpensesSchema>;
export type ExpenseItemSchema = z.infer<typeof expenseItemSchema>;
export type ExpenseInstallmentSchema = z.infer<typeof expenseInstallmentSchema>;
export type ExpensePaymentSchema = z.infer<typeof expensePaymentSchema>;
export type ExpenseAttachmentSchema = z.infer<typeof expenseAttachmentSchema>;
export type ExpenseStatsSchema = z.infer<typeof expenseStatsSchema>;
