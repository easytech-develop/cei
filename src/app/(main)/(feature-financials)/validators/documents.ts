import { DocumentDirection, DocumentStatus } from "@prisma/client";
import { z } from "zod";

export const documentDirectionSchema = z.enum(DocumentDirection);
export const documentStatusSchema = z.enum(DocumentStatus);

export const installmentSchema = z.object({
  number: z.number().int().positive("Número da parcela deve ser maior que zero"),
  amount: z.number().positive("Valor da parcela deve ser maior que zero"),
  dueAt: z.date(),
});

export const createDocumentSchema = z.object({
  direction: documentDirectionSchema,
  contactId: z.string().min(1, "Contato é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  costCenterId: z.string().optional(),
  billingRuleId: z.string().optional(),
  totalAmount: z.string().min(1, "Valor é obrigatório"),
  issueAt: z.date(),
  dueAt: z.date(),
  competenceAt: z.date(),
  status: documentStatusSchema,
  documentNumber: z.string().optional(),
  fiscalKey: z.string().optional(),
  series: z.string().optional(),
  description: z.string().optional(),
  isInstallment: z.boolean(),
  installments: z.array(installmentSchema).optional(),
});

export const updateDocumentSchema = createDocumentSchema.extend({
  id: z.string().min(1, "ID é obrigatório"),
});

export const documentFiltersSchema = z.object({
  search: z.string().optional(),
  direction: z.array(documentDirectionSchema).optional(),
  status: z.array(documentStatusSchema).optional(),
  contactId: z.string().optional(),
  categoryId: z.string().optional(),
  costCenterId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  dueDateFrom: z.date().optional(),
  dueDateTo: z.date().optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
});

export type CreateDocumentSchema = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentSchema = z.infer<typeof updateDocumentSchema>;
export type DocumentFiltersSchema = z.infer<typeof documentFiltersSchema>;
