import { CashAccountType } from "@prisma/client";
import { z } from "zod";

// Schema para criação de conta bancária
export const createCashAccountSchema = z.object({
  name: z.string().min(1, "Informe o nome da conta"),
  type: z.enum(Object.values(CashAccountType)),
  agency: z.string().optional(),
  accountNumber: z.string().optional(),
  pixKey: z.string().optional(),
  accountId: z.string().optional(),
  openingBalance: z.string().min(1, "Saldo inicial é obrigatório"),
  isActive: z.boolean(),
});

// Schema para atualização de conta bancária
export const updateCashAccountSchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  type: z.enum(Object.values(CashAccountType)),
  agency: z.string().optional(),
  accountNumber: z.string().optional(),
  pixKey: z.string().optional(),
  accountId: z.string().optional(),
  openingBalance: z.string().min(1, "Saldo inicial é obrigatório"),
  isActive: z.boolean(),
});

// Schema para resposta de conta bancária
export const cashAccountResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(Object.values(CashAccountType) as [string, ...string[]]),
  agency: z.string().nullable(),
  accountNumber: z.string().nullable(),
  pixKey: z.string().nullable(),
  accountId: z.string().nullable(),
  openingBalance: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para listagem de contas bancárias
export const listCashAccountsSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  search: z.string().optional(),
  type: z.enum(Object.values(CashAccountType) as [string, ...string[]]).optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(["name", "type", "agency", "accountNumber", "createdAt"]),
  sortOrder: z.enum(["asc", "desc"]),
});

// Tipos derivados dos schemas
export type CreateCashAccountSchema = z.infer<typeof createCashAccountSchema>;
export type UpdateCashAccountSchema = z.infer<typeof updateCashAccountSchema>;
export type CashAccountResponse = z.infer<typeof cashAccountResponseSchema>;
export type ListCashAccountsSchema = z.infer<typeof listCashAccountsSchema>;
