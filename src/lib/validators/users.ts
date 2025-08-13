import { z } from "zod"

// Schema para criação de usuário
export const createUserSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  email: z.string().email("Informe um email válido"),
  password: z.string().min(6, "Senha deve ter pelo menos 8 caracteres"),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  roleId: z.string().nonempty("Informe o cargo"),
})

// Schema para atualização de usuário
export const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  roleId: z.string().nonempty("Informe o cargo"),
})

// Schema para alteração de senha
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

// Schema para resposta de usuário (sem senha)
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
})

// Schema para listagem de usuários
export const listUsersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  sortBy: z.enum(["name", "email", "createdAt", "status"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

// Tipos derivados dos schemas
export type CreateUserSchema = z.infer<typeof createUserSchema>
export type UpdateUserSchema = z.infer<typeof updateUserSchema>
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
export type ListUsersSchema = z.infer<typeof listUsersSchema>
