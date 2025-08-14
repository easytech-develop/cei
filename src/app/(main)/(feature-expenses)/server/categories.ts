"use server";

import type { ExpenseCategory, Prisma } from "@prisma/client";
import type {
  CreateCategorySchema,
  UpdateCategorySchema,
} from "@/app/(main)/(feature-expenses)/validators/categories";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { CategoryWithChildren } from "../types/categories";

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
    CODE_EXISTS: "Já existe uma categoria com este código",
    PARENT_NOT_FOUND: "Categoria pai não encontrada",
  },
} as const;

const validateCategoryExists = async (
  id: string,
): Promise<ExpenseCategory | null> => {
  const category = await prisma.expenseCategory.findUnique({
    where: { id },
  });
  return category;
};

const validateCodeUniqueness = async (
  code: string,
  excludeId?: string,
): Promise<boolean> => {
  const where: Prisma.ExpenseCategoryWhereInput = {
    code: code.trim(),
    deletedAt: null,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existingCategory = await prisma.expenseCategory.findFirst({ where });
  return !existingCategory;
};

const validateParentExists = async (parentId: string): Promise<boolean> => {
  const parent = await prisma.expenseCategory.findFirst({
    where: { id: parentId, deletedAt: null },
  });
  return !!parent;
};

export async function getCategories({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    parentId?: string | null | undefined;
  };
}): ActionResponse<{
  categories: CategoryWithChildren[];
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

    const where: Prisma.ExpenseCategoryWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: "insensitive" } },
        { code: { contains: filters.search.trim(), mode: "insensitive" } },
      ];
    }

    if (filters?.parentId !== undefined && filters?.parentId !== null) {
      where.parentId = filters.parentId;
    } else if (filters?.parentId === null) {
      where.parentId = null;
    }

    // Executar consultas em paralelo para melhor performance
    const [categories, total] = await Promise.all([
      prisma.expenseCategory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ code: "asc" }],
        include: {
          children: {
            where: { deletedAt: null },
            orderBy: { code: "asc" },
          },
          parent: true,
        },
      }),
      prisma.expenseCategory.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.CATEGORIES.LISTED_SUCCESS,
      data: {
        categories,
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

export async function createCategory(
  data: CreateCategorySchema,
): ActionResponse<{
  category: ExpenseCategory;
}> {
  try {
    if (!data.code?.trim()) {
      return { success: false, message: "Código é obrigatório" };
    }

    if (!data.name?.trim()) {
      return { success: false, message: "Nome é obrigatório" };
    }

    // Validar código único
    const codeUnique = await validateCodeUniqueness(data.code.trim());
    if (!codeUnique) {
      return { success: false, message: MESSAGES.CATEGORIES.CODE_EXISTS };
    }

    // Validar categoria pai se informada
    if (data.parentId) {
      const parentExists = await validateParentExists(data.parentId);
      if (!parentExists) {
        return {
          success: false,
          message: MESSAGES.CATEGORIES.PARENT_NOT_FOUND,
        };
      }
    }

    // Verificar se existe categoria deletada com o mesmo código
    const existingDeletedCategory = await prisma.expenseCategory.findFirst({
      where: {
        code: data.code.trim(),
        deletedAt: { not: null },
      },
    });

    if (existingDeletedCategory) {
      // Restaurar categoria deletada
      const category = await prisma.expenseCategory.update({
        where: { id: existingDeletedCategory.id },
        data: {
          deletedAt: null,
          code: data.code.trim(),
          name: data.name.trim(),
          parentId: data.parentId || null,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: MESSAGES.CATEGORIES.UPDATED_SUCCESS,
        data: { category },
      };
    }

    const category = await prisma.expenseCategory.create({
      data: {
        code: data.code.trim(),
        name: data.name.trim(),
        parentId: data.parentId || null,
      },
    });

    return {
      success: true,
      message: MESSAGES.CATEGORIES.CREATED_SUCCESS,
      data: { category },
    };
  } catch (error) {
    logError({ error, where: "createCategory" });
    return { success: false, message: MESSAGES.CATEGORIES.CREATED_ERROR };
  }
}

export async function updateCategory(
  data: UpdateCategorySchema,
): ActionResponse<{
  category: ExpenseCategory;
}> {
  try {
    const existingCategory = await validateCategoryExists(data.id);
    if (!existingCategory) {
      return { success: false, message: MESSAGES.CATEGORIES.NOT_FOUND };
    }

    if (!data.code?.trim()) {
      return { success: false, message: "Código é obrigatório" };
    }

    if (!data.name?.trim()) {
      return { success: false, message: "Nome é obrigatório" };
    }

    // Validar código único
    const codeUnique = await validateCodeUniqueness(data.code.trim(), data.id);
    if (!codeUnique) {
      return { success: false, message: MESSAGES.CATEGORIES.CODE_EXISTS };
    }

    // Validar categoria pai se informada
    if (data.parentId) {
      const parentExists = await validateParentExists(data.parentId);
      if (!parentExists) {
        return {
          success: false,
          message: MESSAGES.CATEGORIES.PARENT_NOT_FOUND,
        };
      }
    }

    const category = await prisma.expenseCategory.update({
      where: { id: data.id },
      data: {
        code: data.code.trim(),
        name: data.name.trim(),
        parentId: data.parentId || null,
      },
    });

    return {
      success: true,
      message: MESSAGES.CATEGORIES.UPDATED_SUCCESS,
      data: { category },
    };
  } catch (error) {
    logError({ error, where: "updateCategory" });
    return { success: false, message: MESSAGES.CATEGORIES.UPDATED_ERROR };
  }
}

export async function deleteCategory(id: string): ActionResponse<{
  category: ExpenseCategory;
}> {
  try {
    const existingCategory = await validateCategoryExists(id);
    if (!existingCategory) {
      return { success: false, message: MESSAGES.CATEGORIES.NOT_FOUND };
    }

    const category = await prisma.expenseCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
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
