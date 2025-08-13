"use server";

import type { Prisma, Vendor } from "@prisma/client";
import type {
  CreateVendorSchema,
  UpdateVendorSchema,
} from "@/app/(main)/(feature-expenses)/validators/vendors";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { VendorWithExpenses } from "../types/vendors";

const MESSAGES = {
  VENDORS: {
    LISTED_SUCCESS: "Fornecedores listados com sucesso",
    LIST_ERROR: "Erro ao listar fornecedores",
    CREATED_SUCCESS: "Fornecedor criado com sucesso",
    CREATED_ERROR: "Erro ao criar fornecedor",
    UPDATED_SUCCESS: "Fornecedor atualizado com sucesso",
    UPDATED_ERROR: "Erro ao atualizar fornecedor",
    DELETED_SUCCESS: "Fornecedor excluído com sucesso",
    DELETED_ERROR: "Erro ao excluir fornecedor",
    NOT_FOUND: "Fornecedor não encontrado",
    DOCUMENT_EXISTS: "Já existe um fornecedor com este documento",
  },
} as const;

const validateVendorExists = async (id: string): Promise<Vendor | null> => {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
  });
  return vendor;
};

const validateDocumentUniqueness = async (
  document: string,
  excludeId?: string,
): Promise<boolean> => {
  if (!document?.trim()) return true;

  const where: Prisma.VendorWhereInput = {
    document: document.trim(),
    deletedAt: null,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existingVendor = await prisma.vendor.findFirst({ where });
  return !existingVendor;
};

export async function getVendors({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    active?: boolean;
  };
}): ActionResponse<{
  vendors: VendorWithExpenses[];
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

    const where: Prisma.VendorWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: "insensitive" } },
        { document: { contains: filters.search.trim(), mode: "insensitive" } },
        { email: { contains: filters.search.trim(), mode: "insensitive" } },
      ];
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    // Executar consultas em paralelo para melhor performance
    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ name: "asc" }],
        include: {
          Expenses: {
            where: { deletedAt: null },
          },
        },
      }),
      prisma.vendor.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.VENDORS.LISTED_SUCCESS,
      data: {
        vendors,
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getVendors" });
    return { success: false, message: MESSAGES.VENDORS.LIST_ERROR };
  }
}

export async function createVendor(data: CreateVendorSchema): ActionResponse<{
  vendor: Vendor;
}> {
  try {
    if (!data.name?.trim()) {
      return { success: false, message: "Nome é obrigatório" };
    }

    // Validar documento único
    if (data.document?.trim()) {
      const documentUnique = await validateDocumentUniqueness(data.document.trim());
      if (!documentUnique) {
        return { success: false, message: MESSAGES.VENDORS.DOCUMENT_EXISTS };
      }
    }

    // Verificar se existe fornecedor deletado com o mesmo documento
    if (data.document?.trim()) {
      const existingDeletedVendor = await prisma.vendor.findFirst({
        where: {
          document: data.document.trim(),
          deletedAt: { not: null },
        },
      });

      if (existingDeletedVendor) {
        // Restaurar fornecedor deletado
        const vendor = await prisma.vendor.update({
          where: { id: existingDeletedVendor.id },
          data: {
            deletedAt: null,
            name: data.name.trim(),
            document: data.document.trim(),
            email: data.email?.trim() || null,
            phone: data.phone?.trim() || null,
            active: data.active,
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          message: MESSAGES.VENDORS.UPDATED_SUCCESS,
          data: { vendor },
        };
      }
    }

    const vendor = await prisma.vendor.create({
      data: {
        name: data.name.trim(),
        document: data.document?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        active: data.active,
      },
    });

    return {
      success: true,
      message: MESSAGES.VENDORS.CREATED_SUCCESS,
      data: { vendor },
    };
  } catch (error) {
    logError({ error, where: "createVendor" });
    return { success: false, message: MESSAGES.VENDORS.CREATED_ERROR };
  }
}

export async function updateVendor(data: UpdateVendorSchema): ActionResponse<{
  vendor: Vendor;
}> {
  try {
    const existingVendor = await validateVendorExists(data.id);
    if (!existingVendor) {
      return { success: false, message: MESSAGES.VENDORS.NOT_FOUND };
    }

    if (!data.name?.trim()) {
      return { success: false, message: "Nome é obrigatório" };
    }

    // Validar documento único
    if (data.document?.trim()) {
      const documentUnique = await validateDocumentUniqueness(data.document.trim(), data.id);
      if (!documentUnique) {
        return { success: false, message: MESSAGES.VENDORS.DOCUMENT_EXISTS };
      }
    }

    const vendor = await prisma.vendor.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        document: data.document?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        active: data.active,
      },
    });

    return {
      success: true,
      message: MESSAGES.VENDORS.UPDATED_SUCCESS,
      data: { vendor },
    };
  } catch (error) {
    logError({ error, where: "updateVendor" });
    return { success: false, message: MESSAGES.VENDORS.UPDATED_ERROR };
  }
}

export async function deleteVendor(id: string): ActionResponse<{
  vendor: Vendor;
}> {
  try {
    const existingVendor = await validateVendorExists(id);
    if (!existingVendor) {
      return { success: false, message: MESSAGES.VENDORS.NOT_FOUND };
    }

    const vendor = await prisma.vendor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: MESSAGES.VENDORS.DELETED_SUCCESS,
      data: { vendor },
    };
  } catch (error) {
    logError({ error, where: "deleteVendor" });
    return { success: false, message: MESSAGES.VENDORS.DELETED_ERROR };
  }
}
