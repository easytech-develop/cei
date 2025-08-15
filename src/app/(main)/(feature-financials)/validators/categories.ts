import { DocumentDirection } from "@prisma/client";
import { z } from "zod";

// Schema para criação de categoria
export const createCategorySchema = z.object({
  name: z.string().min(1, "Informe o nome da categoria"),
  direction: z.enum(Object.values(DocumentDirection)),
  description: z.string().optional(),
  accountId: z.string().optional(),
});

// Schema para atualização de categoria
export const updateCategorySchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  direction: z.enum(Object.values(DocumentDirection)),
  description: z.string().optional(),
  accountId: z.string().optional(),
});

// Schema para resposta de categoria
export const categoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  direction: z.enum(Object.values(DocumentDirection) as [string, ...string[]]),
  description: z.string().nullable(),
  accountId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para listagem de categorias
export const listCategoriesSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  search: z.string().optional(),
  direction: z.enum(Object.values(DocumentDirection) as [string, ...string[]]).optional(),
  sortBy: z.enum(["name", "direction", "createdAt"]),
  sortOrder: z.enum(["asc", "desc"]),
});

// Tipos derivados dos schemas
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type ListCategoriesSchema = z.infer<typeof listCategoriesSchema>;
