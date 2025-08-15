"use server";

import type { DocumentDirection, Prisma } from "@prisma/client";
import type {
  CreateDocumentSchema,
} from "@/app/(main)/(feature-financials)/validators/documents";
import { logError, parseCurrencyToDecimal } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { DocumentFilters, DocumentResponse } from "../types/documents";

const MESSAGES = {
  DOCUMENTS: {
    LISTED_SUCCESS: "Documentos listados com sucesso",
    LIST_ERROR: "Erro ao listar documentos",
    CREATED_SUCCESS: "Documento criado com sucesso",
    CREATED_ERROR: "Erro ao criar documento",
    UPDATED_SUCCESS: "Documento atualizado com sucesso",
    UPDATED_ERROR: "Erro ao atualizar documento",
    DELETED_SUCCESS: "Documento excluído com sucesso",
    DELETED_ERROR: "Erro ao excluir documento",
    NOT_FOUND: "Documento não encontrado",
    DUPLICATE_DOCUMENT: "Já existe um documento com este número e série",
  },
} as const;

const validateDocumentUniqueness = async (
  direction: DocumentDirection,
  contactId: string,
  series: string | null,
  documentNumber: string | null,
  excludeId?: string,
): Promise<boolean> => {
  if (!documentNumber?.trim()) return true;

  const where: Prisma.DocumentWhereInput = {
    direction,
    contactId,
    series: series?.trim() || null,
    documentNumber: documentNumber.trim(),
    deletedAt: null,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existingDocument = await prisma.document.findFirst({ where });
  return !existingDocument;
};

export async function getDocuments({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: DocumentFilters;
}): ActionResponse<{
  documents: DocumentResponse[];
  meta: Meta;
}> {
  try {
    const { page, limit } = meta;

    if (page < 1 || limit < 1) {
      return {
        success: false,
        message: "Parâmetros de paginação inválidos",
      };
    }

    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        {
          documentNumber: {
            contains: filters.search.trim(),
            mode: "insensitive",
          },
        },
        { fiscalKey: { contains: filters.search.trim(), mode: "insensitive" } },
        { series: { contains: filters.search.trim(), mode: "insensitive" } },
        {
          description: { contains: filters.search.trim(), mode: "insensitive" },
        },
        {
          contact: {
            name: { contains: filters.search.trim(), mode: "insensitive" },
          },
        },
        {
          contact: {
            document: { contains: filters.search.trim(), mode: "insensitive" },
          },
        },
        {
          category: {
            name: { contains: filters.search.trim(), mode: "insensitive" },
          },
        },
      ];
    }

    // Filtros de direção
    if (filters?.direction?.length) {
      where.direction = { in: filters.direction };
    }

    // Filtros de status
    if (filters?.status?.length) {
      where.status = { in: filters.status };
    }

    // Filtros de relacionamentos
    if (filters?.contactId) {
      where.contactId = filters.contactId;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.costCenterId) {
      where.costCenterId = filters.costCenterId;
    }

    // Filtros de data
    if (filters?.dateFrom || filters?.dateTo) {
      where.issueAt = {};
      if (filters.dateFrom) {
        where.issueAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.issueAt.lte = filters.dateTo;
      }
    }

    // Filtros de data de vencimento
    if (filters?.dueDateFrom || filters?.dueDateTo) {
      where.dueAt = {};
      if (filters.dueDateFrom) {
        where.dueAt.gte = filters.dueDateFrom;
      }
      if (filters.dueDateTo) {
        where.dueAt.lte = filters.dueDateTo;
      }
    }

    // Filtros de valor
    if (filters?.amountMin || filters?.amountMax) {
      where.totalAmount = {};
      if (filters.amountMin) {
        where.totalAmount.gte = filters.amountMin;
      }
      if (filters.amountMax) {
        where.totalAmount.lte = filters.amountMax;
      }
    }

    // Executar consultas em paralelo para melhor performance
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              document: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          costCenter: {
            select: {
              id: true,
              name: true,
            },
          },
          billingRule: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ dueAt: "desc" }, { createdAt: "desc" }],
      }),
      prisma.document.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.DOCUMENTS.LISTED_SUCCESS,
      data: {
        documents: documents.map((document) => ({
          id: document.id,
          direction: document.direction,
          contactId: document.contactId,
          contact: {
            id: document.contact.id,
            name: document.contact.name,
            document: document.contact.document,
          },
          categoryId: document.categoryId,
          category: {
            id: document.category.id,
            name: document.category.name,
          },
          costCenterId: document.costCenterId,
          costCenter: document.costCenter
            ? {
              id: document.costCenter.id,
              name: document.costCenter.name,
            }
            : null,
          billingRuleId: document.billingRuleId,
          billingRule: document.billingRule
            ? {
              id: document.billingRule.id,
              name: document.billingRule.name,
            }
            : null,
          totalAmount: document.totalAmount.toString(),
          issueAt: document.issueAt,
          dueAt: document.dueAt,
          competenceAt: document.competenceAt,
          status: document.status,
          documentNumber: document.documentNumber,
          fiscalKey: document.fiscalKey,
          series: document.series,
          description: document.description,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          deletedAt: document.deletedAt,
        })),
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getDocuments" });
    return { success: false, message: MESSAGES.DOCUMENTS.LIST_ERROR };
  }
}

export async function getDocumentById(id: string): ActionResponse<{
  document: DocumentResponse;
}> {
  try {
    if (!id?.trim()) {
      return { success: false, message: "ID do documento é obrigatório" };
    }

    const document = await prisma.document.findUnique({
      where: { id, deletedAt: null },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            document: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        costCenter: {
          select: {
            id: true,
            name: true,
          },
        },
        billingRule: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!document) {
      return { success: false, message: MESSAGES.DOCUMENTS.NOT_FOUND };
    }

    return {
      success: true,
      message: "Documento encontrado com sucesso",
      data: {
        document: {
          id: document.id,
          direction: document.direction,
          contactId: document.contactId,
          contact: {
            id: document.contact.id,
            name: document.contact.name,
            document: document.contact.document,
          },
          categoryId: document.categoryId,
          category: {
            id: document.category.id,
            name: document.category.name,
          },
          costCenterId: document.costCenterId,
          costCenter: document.costCenter
            ? {
              id: document.costCenter.id,
              name: document.costCenter.name,
            }
            : null,
          billingRuleId: document.billingRuleId,
          billingRule: document.billingRule
            ? {
              id: document.billingRule.id,
              name: document.billingRule.name,
            }
            : null,
          totalAmount: document.totalAmount.toString(),
          issueAt: document.issueAt,
          dueAt: document.dueAt,
          competenceAt: document.competenceAt,
          status: document.status,
          documentNumber: document.documentNumber,
          fiscalKey: document.fiscalKey,
          series: document.series,
          description: document.description,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          deletedAt: document.deletedAt,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getDocumentById" });
    return { success: false, message: "Erro ao buscar documento" };
  }
}

export async function createDocument(
  data: CreateDocumentSchema,
): ActionResponse<{
  document: DocumentResponse;
}> {
  try {
    // Validar se o documento já existe
    const isUnique = await validateDocumentUniqueness(
      data.direction,
      data.contactId,
      data.series || null,
      data.documentNumber || null,
    );

    if (!isUnique) {
      return {
        success: false,
        message: MESSAGES.DOCUMENTS.DUPLICATE_DOCUMENT,
      };
    }

    // Criar o documento
    const document = await prisma.document.create({
      data: {
        direction: data.direction,
        contactId: data.contactId,
        categoryId: data.categoryId,
        costCenterId: data.costCenterId || null,
        billingRuleId: data.billingRuleId || null,
        totalAmount: Number(parseCurrencyToDecimal(data.totalAmount)),
        issueAt: data.issueAt,
        dueAt: data.dueAt,
        competenceAt: data.competenceAt,
        status: data.status,
        documentNumber: data.documentNumber || null,
        fiscalKey: data.fiscalKey || null,
        series: data.series || null,
        description: data.description || null,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            document: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        costCenter: {
          select: {
            id: true,
            name: true,
          },
        },
        billingRule: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Criar parcelas se necessário
    if (data.isInstallment && data.installments && data.installments.length > 0) {
      await prisma.installment.createMany({
        data: data.installments.map((installment) => ({
          documentId: document.id,
          number: installment.number,
          amount: installment.amount,
          dueAt: installment.dueAt,
        })),
      });
    }

    return {
      success: true,
      message: MESSAGES.DOCUMENTS.CREATED_SUCCESS,
      data: {
        document: {
          id: document.id,
          direction: document.direction,
          contactId: document.contactId,
          contact: {
            id: document.contact.id,
            name: document.contact.name,
            document: document.contact.document,
          },
          categoryId: document.categoryId,
          category: {
            id: document.category.id,
            name: document.category.name,
          },
          costCenterId: document.costCenterId,
          costCenter: document.costCenter
            ? {
              id: document.costCenter.id,
              name: document.costCenter.name,
            }
            : null,
          billingRuleId: document.billingRuleId,
          billingRule: document.billingRule
            ? {
              id: document.billingRule.id,
              name: document.billingRule.name,
            }
            : null,
          totalAmount: document.totalAmount.toString(),
          issueAt: document.issueAt,
          dueAt: document.dueAt,
          competenceAt: document.competenceAt,
          status: document.status,
          documentNumber: document.documentNumber,
          fiscalKey: document.fiscalKey,
          series: document.series,
          description: document.description,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          deletedAt: document.deletedAt,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "createDocument" });
    return {
      success: false,
      message: MESSAGES.DOCUMENTS.CREATED_ERROR,
    };
  }
}
