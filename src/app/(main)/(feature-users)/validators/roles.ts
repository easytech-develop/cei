import { z } from "zod"

// Schema para criação de cargo
export const createRoleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  slug: z.string().min(1, "Slug é obrigatório").max(50, "Slug muito longo"),
})

// Schema para atualização de cargo
export const updateRoleSchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  slug: z.string().min(1, "Slug é obrigatório").max(50, "Slug muito longo"),
})

// Schema para resposta de cargo
export const roleResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Schema para listagem de cargos
export const listRolesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["name", "slug", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// Tipos derivados dos schemas
export type CreateRoleSchema = z.infer<typeof createRoleSchema>
export type UpdateRoleSchema = z.infer<typeof updateRoleSchema>
export type RoleResponse = z.infer<typeof roleResponseSchema>
export type ListRolesSchema = z.infer<typeof listRolesSchema>
