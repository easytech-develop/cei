"use server";

import type { Prisma } from "@prisma/client";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";

const MESSAGES = {
  COST_CENTERS: {
    LISTED_SUCCESS: "Centros de custo listados com sucesso",
    LIST_ERROR: "Erro ao listar centros de custo",
  },
} as const;

export async function getCostCenters({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
  };
}): ActionResponse<{
  costCenters: Array<{
    id: string;
    name: string;
    code: string | null;
  }>;
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

    const where: Prisma.CostCenterWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        {
          name: {
            contains: filters.search.trim(),
            mode: "insensitive",
          },
        },
        {
          code: {
            contains: filters.search.trim(),
            mode: "insensitive",
          },
        },
      ];
    }

    const [costCenters, total] = await Promise.all([
      prisma.costCenter.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.costCenter.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.COST_CENTERS.LISTED_SUCCESS,
      data: {
        costCenters,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({
      where: "getCostCenters",
      error,
    });
    return {
      success: false,
      message: MESSAGES.COST_CENTERS.LIST_ERROR,
    };
  }
}
