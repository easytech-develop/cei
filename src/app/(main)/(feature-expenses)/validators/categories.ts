import { z } from "zod";

// Schema para criação de categoria
export const createCategorySchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  parentId: z.string().optional(),
});

// Schema para atualização de categoria
export const updateCategorySchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  parentId: z.string().optional(),
});

// Schema para resposta de categoria
export const categoryResponseSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para listagem de categorias
export const listCategoriesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  parentId: z.string().optional(),
  sortBy: z.enum(["code", "name", "createdAt"]).default("code"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Tipos derivados dos schemas
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type ListCategoriesSchema = z.infer<typeof listCategoriesSchema>;
