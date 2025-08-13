import { z } from "zod";

// Schema para criação de fornecedor
export const createVendorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  document: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  active: z.boolean(),
});

// Schema para atualização de fornecedor
export const updateVendorSchema = z.object({
  id: z.string().nonempty("ID é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  document: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  active: z.boolean(),
});

// Schema para resposta de fornecedor
export const vendorResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  document: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para listagem de fornecedores
export const listVendorsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  active: z.boolean().optional(),
  sortBy: z.enum(["name", "document", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Tipos derivados dos schemas
export type CreateVendorSchema = z.infer<typeof createVendorSchema>;
export type UpdateVendorSchema = z.infer<typeof updateVendorSchema>;
export type VendorResponse = z.infer<typeof vendorResponseSchema>;
export type ListVendorsSchema = z.infer<typeof listVendorsSchema>;
