import { z } from "zod";

// Schema para criação de permissão
export const createPermissionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: z.string().optional(),
  resource: z.string().min(1, "Recurso é obrigatório").max(100, "Recurso muito longo"),
  action: z.string().min(1, "Ação é obrigatória").max(50, "Ação muito longa"),
});

// Schema para atualização de permissão
export const updatePermissionSchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  description: z.string().optional(),
  resource: z.string().min(1, "Recurso é obrigatório").max(100, "Recurso muito longo"),
  action: z.string().min(1, "Ação é obrigatória").max(50, "Ação muito longa"),
});

// Schema para resposta de permissão
export const permissionResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  resource: z.string(),
  action: z.string(),
  code: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para listagem de permissões
export const listPermissionsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  resource: z.string().optional(),
  action: z.string().optional(),
  sortBy: z.enum(["name", "resource", "action", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Schema para gerenciar permissões de role
export const manageRolePermissionsSchema = z.object({
  roleId: z.string().nonempty("ID do cargo é obrigatório"),
  permissionIds: z.array(z.string()).min(1, "Pelo menos uma permissão é obrigatória"),
});

// Schema para gerenciar permissões de usuário
export const manageUserPermissionsSchema = z.object({
  userId: z.string().nonempty("ID do usuário é obrigatório"),
  permissions: z.array(z.object({
    permissionId: z.string().nonempty("ID da permissão é obrigatório"),
    mode: z.enum(["GRANT", "DENY"]),
    scopeJson: z.any().optional(),
  })),
});

// Tipos derivados dos schemas
export type CreatePermissionSchema = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionSchema = z.infer<typeof updatePermissionSchema>;
export type PermissionResponse = z.infer<typeof permissionResponseSchema>;
export type ListPermissionsSchema = z.infer<typeof listPermissionsSchema>;
export type ManageRolePermissionsSchema = z.infer<typeof manageRolePermissionsSchema>;
export type ManageUserPermissionsSchema = z.infer<typeof manageUserPermissionsSchema>;
