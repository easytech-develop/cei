"use server";

import type { Category, DocumentDirection, Prisma } from "@prisma/client";
import type {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "@/app/(main)/(feature-financials)/validators/categories";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { CategoryResponse } from "../types/categories";

const MESSAGES = {
  CATEGORIES: {
    LISTED_SUCCESS: "Categorias listadas com sucesso",
    LIST_ERROR: "Erro ao listar categorias",
    CREATED_SUCCESS: "Categoria criada com sucesso",
    CREATED_ERROR: "Erro ao criar categoria",
    UPDATED_SUCCESS: "Categoria atualizada com sucesso",
    UPDATED_ERROR: "Erro ao atualizar categoria",
    DELETED_SUCCESS: "Categoria excluída com sucesso",
    DELETED_ERROR: "Erro ao excluir categoria",
    NOT_FOUND: "Categoria não encontrada",
    NAME_REQUIRED: "Nome é obrigatório",
    ACCOUNT_NOT_FOUND: "Conta contábil não encontrada",
  },
} as const;

const validateCategoryExists = async (id: string): Promise<Category | null> => {
  const category = await prisma.category.findUnique({
    where: { id },
  });
  return category;
};

const validateAccountExists = async (accountId: string): Promise<boolean> => {
  if (!accountId || !accountId.trim()) return true;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });
  return !!account;
};

export async function getCategories({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    direction?: DocumentDirection;
  };
}): ActionResponse<{
  categories: CategoryResponse[];
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

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: "insensitive" } },
        {
          description: { contains: filters.search.trim(), mode: "insensitive" },
        },
      ];
    }

    if (filters?.direction) {
      where.direction = filters.direction;
    }

    // Executar consultas em paralelo para melhor performance
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        include: {
          account: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.CATEGORIES.LISTED_SUCCESS,
      data: {
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          direction: category.direction,
          description: category.description,
          accountId: category.accountId,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          deletedAt: category.deletedAt,
        })),
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getCategories" });
    return { success: false, message: MESSAGES.CATEGORIES.LIST_ERROR };
  }
}

export async function getCategoryById(id: string): ActionResponse<{
  category: CategoryResponse;
}> {
  try {
    if (!id?.trim()) {
      return { success: false, message: "ID da categoria é obrigatório" };
    }

    const category = await prisma.category.findUnique({
      where: { id, deletedAt: null },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, message: MESSAGES.CATEGORIES.NOT_FOUND };
    }

    return {
      success: true,
      message: "Categoria encontrada com sucesso",
      data: {
        category: {
          id: category.id,
          name: category.name,
          direction: category.direction,
          description: category.description,
          accountId: category.accountId,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          deletedAt: category.deletedAt,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getCategoryById" });
    return { success: false, message: "Erro ao buscar categoria" };
  }
}

export async function createCategory(
  data: CreateCategorySchema,
): ActionResponse<{
  category: CategoryResponse;
}> {
  try {
    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.CATEGORIES.NAME_REQUIRED };
    }

    // Validar se a conta contábil existe
    if (data.accountId?.trim()) {
      const accountExists = await validateAccountExists(data.accountId);
      if (!accountExists) {
        return {
          success: false,
          message: MESSAGES.CATEGORIES.ACCOUNT_NOT_FOUND,
        };
      }
    }

    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        direction: data.direction,
        description: data.description ? data.description.trim() : null,
        accountId: data.accountId?.trim() ? data.accountId : null,
      },
    });

    return {
      success: true,
      message: MESSAGES.CATEGORIES.CREATED_SUCCESS,
      data: {
        category: {
          id: category.id,
          name: category.name,
          direction: category.direction,
          description: category.description,
          accountId: category.accountId,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          deletedAt: category.deletedAt,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "createCategory" });
    return { success: false, message: MESSAGES.CATEGORIES.CREATED_ERROR };
  }
}

export async function updateCategory(
  data: UpdateCategorySchema,
): ActionResponse<{
  category: CategoryResponse;
}> {
  try {
    // Validações
    if (!data.id.trim()) {
      return { success: false, message: "ID da categoria é obrigatório" };
    }

    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.CATEGORIES.NAME_REQUIRED };
    }

    // Verificar se a categoria existe
    const existingCategory = await validateCategoryExists(data.id);
    if (!existingCategory) {
      return { success: false, message: MESSAGES.CATEGORIES.NOT_FOUND };
    }

    // Validar se a conta contábil existe
    if (data.accountId?.trim()) {
      const accountExists = await validateAccountExists(data.accountId);
      if (!accountExists) {
        return {
          success: false,
          message: MESSAGES.CATEGORIES.ACCOUNT_NOT_FOUND,
        };
      }
    }

    const category = await prisma.category.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        direction: data.direction,
        description: data.description ? data.description.trim() : null,
        accountId: data.accountId?.trim() ? data.accountId : null,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: MESSAGES.CATEGORIES.UPDATED_SUCCESS,
      data: {
        category: {
          id: category.id,
          name: category.name,
          direction: category.direction,
          description: category.description,
          accountId: category.accountId,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          deletedAt: category.deletedAt,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "updateCategory" });
    return { success: false, message: MESSAGES.CATEGORIES.UPDATED_ERROR };
  }
}

export async function deleteCategory(id: string): ActionResponse<{
  category: Category;
}> {
  try {
    // Validação
    if (!id?.trim()) {
      return { success: false, message: "ID da categoria é obrigatório" };
    }

    // Verificar se a categoria existe
    const existingCategory = await validateCategoryExists(id);
    if (!existingCategory) {
      return { success: false, message: MESSAGES.CATEGORIES.NOT_FOUND };
    }

    // Verificar se já está deletado
    if (existingCategory.deletedAt) {
      return { success: false, message: "Categoria já foi excluída" };
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: MESSAGES.CATEGORIES.DELETED_SUCCESS,
      data: { category },
    };
  } catch (error) {
    logError({ error, where: "deleteCategory" });
    return { success: false, message: MESSAGES.CATEGORIES.DELETED_ERROR };
  }
}
