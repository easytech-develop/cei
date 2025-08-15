import { z } from "zod";

// Schema para criação de conta
export const createAccountSchema = z.object({
  name: z.string().min(1, "Informe o nome da conta"),
  code: z.string().optional(),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  parentId: z.string().optional(),
});

// Schema para atualização de conta
export const updateAccountSchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  code: z.string().optional(),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  parentId: z.string().optional(),
});

// Schema para resposta de conta
export const accountResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().nullable(),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  parentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para listagem de contas
export const listAccountsSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  search: z.string().optional(),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]).optional(),
  parentId: z.string().optional(),
  sortBy: z.enum(["name", "code", "type", "createdAt"]),
  sortOrder: z.enum(["asc", "desc"]),
});

// Schema para hierarquia de contas
export const accountHierarchySchema = z.object({
  id: z.string().optional(),
  includeChildren: z.boolean(),
});

// Tipos derivados dos schemas
export type CreateAccountSchema = z.infer<typeof createAccountSchema>;
export type UpdateAccountSchema = z.infer<typeof updateAccountSchema>;
export type AccountResponse = z.infer<typeof accountResponseSchema>;
export type ListAccountsSchema = z.infer<typeof listAccountsSchema>;
export type AccountHierarchySchema = z.infer<typeof accountHierarchySchema>;
