import type { Prisma, Role } from "@prisma/client";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";

const MESSAGES = {
  ROLES: {
    LISTED_SUCCESS: "Cargos listados com sucesso",
    LIST_ERROR: "Erro ao listar cargos",
  },
};

export async function getRoles({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
  };
}): ActionResponse<{
  roles: Role[];
  meta: Meta;
}> {
  try {
    const { page, limit } = meta;

    if (page < 1 || limit < 1) {
      return { success: false, message: "Parâmetros de paginação inválidos" };
    }

    const where: Prisma.RoleWhereInput = {};

    if (filters?.search) {
      where.name = {
        contains: filters.search.trim(),
        mode: "insensitive",
      };
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        orderBy: [{ name: "asc" }, { createdAt: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.role.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.ROLES.LISTED_SUCCESS,
      data: {
        roles,
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getRoles" });
    return { success: false, message: MESSAGES.ROLES.LIST_ERROR };
  }
}
