import { z } from "zod";

// Schema para criação de conta
export const createAccountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["CASH", "BANK"], {
    message: "Tipo deve ser CASH ou BANK",
  }),
  openingBalance: z.number().default(0),
  active: z.boolean().default(true),
});

// Schema para atualização de conta
export const updateAccountSchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["CASH", "BANK"], {
    message: "Tipo deve ser CASH ou BANK",
  }),
  openingBalance: z.number(),
  active: z.boolean(),
});

// Schema para resposta de conta
export const accountResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(["CASH", "BANK"]),
  openingBalance: z.number(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para listagem de contas
export const listAccountsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.enum(["CASH", "BANK"]).optional(),
  active: z.boolean().optional(),
  sortBy: z.enum(["name", "type", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Tipos derivados dos schemas
export type CreateAccountSchema = z.infer<typeof createAccountSchema>;
export type UpdateAccountSchema = z.infer<typeof updateAccountSchema>;
export type AccountResponse = z.infer<typeof accountResponseSchema>;
export type ListAccountsSchema = z.infer<typeof listAccountsSchema>;
