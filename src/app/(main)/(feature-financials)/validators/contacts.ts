import { ContactRole } from "@prisma/client";
import { z } from "zod";

// Schema para criação de contato
export const createContactSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  document: z.string().optional(),
  email: z
    .string()
    .email("Informe um email válido")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  roles: z.array(z.enum(ContactRole)),
});

// Schema para atualização de contato
export const updateContactSchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório").max(255, "Nome muito longo"),
  document: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  roles: z.array(z.enum(ContactRole)),
});

// Schema para resposta de contato
export const contactResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  document: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  roles: z.array(z.enum(ContactRole)),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para listagem de contatos
export const listContactsSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  search: z.string().optional(),
  roles: z.array(z.enum(ContactRole)).optional(),
  sortBy: z.enum(["name", "document", "email", "createdAt"]),
  sortOrder: z.enum(["asc", "desc"]),
});

// Tipos derivados dos schemas
export type CreateContactSchema = z.infer<typeof createContactSchema>;
export type UpdateContactSchema = z.infer<typeof updateContactSchema>;
export type ContactResponse = z.infer<typeof contactResponseSchema>;
export type ListContactsSchema = z.infer<typeof listContactsSchema>;
