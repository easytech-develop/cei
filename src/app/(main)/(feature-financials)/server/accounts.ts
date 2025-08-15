"use server";

import type { Account, AccountType, Prisma } from "@prisma/client";
import type {
  CreateAccountSchema,
  UpdateAccountSchema,
} from "@/app/(main)/(feature-financials)/validators/accounts";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { AccountResponse, AccountWithParent } from "../types/accounts";

const MESSAGES = {
  ACCOUNTS: {
    LISTED_SUCCESS: "Contas listadas com sucesso",
    LIST_ERROR: "Erro ao listar contas",
    CREATED_SUCCESS: "Conta criada com sucesso",
    CREATED_ERROR: "Erro ao criar conta",
    UPDATED_SUCCESS: "Conta atualizada com sucesso",
    UPDATED_ERROR: "Erro ao atualizar conta",
    DELETED_SUCCESS: "Conta excluída com sucesso",
    DELETED_ERROR: "Erro ao excluir conta",
    NOT_FOUND: "Conta não encontrada",
    NAME_REQUIRED: "Nome é obrigatório",
    PARENT_NOT_FOUND: "Conta pai não encontrada",
    CIRCULAR_REFERENCE: "Referência circular detectada",
  },
} as const;

const validateAccountExists = async (id: string): Promise<Account | null> => {
  const account = await prisma.account.findUnique({
    where: { id },
  });
  return account;
};

const validateParentAccount = async (parentId: string): Promise<boolean> => {
  if (!parentId || !parentId.trim()) return true;

  const parent = await prisma.account.findUnique({
    where: { id: parentId },
  });
  return !!parent;
};

const checkCircularReference = async (
  id: string,
  parentId: string,
): Promise<boolean> => {
  if (id === parentId) return false;

  let currentParentId = parentId;
  const visited = new Set<string>();

  while (currentParentId) {
    if (visited.has(currentParentId)) return false;
    visited.add(currentParentId);

    const parent = await prisma.account.findUnique({
      where: { id: currentParentId },
      select: { parentId: true },
    });

    if (!parent) break;
    currentParentId = parent.parentId || "";
  }

  return true;
};

export async function getAccounts({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    type?: AccountType;
    parentId?: string;
  };
}): ActionResponse<{
  accounts: AccountWithParent[];
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

    const where: Prisma.AccountWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: "insensitive" } },
        { code: { contains: filters.search.trim(), mode: "insensitive" } },
      ];
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.parentId) {
      where.parentId = filters.parentId;
    }

    // Executar consultas em paralelo para melhor performance
    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
            },
          },
        },
      }),
      prisma.account.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.ACCOUNTS.LISTED_SUCCESS,
      data: {
        accounts,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getAccounts" });
    return {
      success: false,
      message: MESSAGES.ACCOUNTS.LIST_ERROR,
    };
  }
}

export async function getAccountById(
  id: string,
): ActionResponse<AccountWithParent> {
  try {
    if (!id || !id.trim()) {
      return {
        success: false,
        message: "ID é obrigatório",
      };
    }

    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
      },
    });

    if (!account) {
      return {
        success: false,
        message: MESSAGES.ACCOUNTS.NOT_FOUND,
      };
    }

    return {
      success: true,
      message: MESSAGES.ACCOUNTS.LISTED_SUCCESS,
      data: account,
    };
  } catch (error) {
    logError({ error, where: "getAccountById" });
    return {
      success: false,
      message: MESSAGES.ACCOUNTS.LIST_ERROR,
    };
  }
}

export async function getAccountHierarchy({
  id,
  includeChildren = true,
}: {
  id?: string;
  includeChildren?: boolean;
}): ActionResponse<AccountWithParent[]> {
  try {
    const where: Prisma.AccountWhereInput = {
      deletedAt: null,
    };

    if (id) {
      where.id = id;
    } else {
      where.parentId = null; // Apenas contas raiz
    }

    const accounts = await prisma.account.findMany({
      where,
      orderBy: [{ name: "asc" }],
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        ...(includeChildren && {
          children: {
            where: { deletedAt: null },
            orderBy: [{ name: "asc" }],
          },
        }),
      },
    });

    return {
      success: true,
      message: MESSAGES.ACCOUNTS.LISTED_SUCCESS,
      data: accounts,
    };
  } catch (error) {
    logError({ error, where: "getAccountHierarchy" });
    return {
      success: false,
      message: MESSAGES.ACCOUNTS.LIST_ERROR,
    };
  }
}

export async function createAccount(
  data: CreateAccountSchema,
): ActionResponse<AccountResponse> {
  try {
    if (!data.name || !data.name.trim()) {
      return {
        success: false,
        message: MESSAGES.ACCOUNTS.NAME_REQUIRED,
      };
    }

    // Validar conta pai se fornecida
    if (data.parentId) {
      const parentExists = await validateParentAccount(data.parentId);
      if (!parentExists) {
        return {
          success: false,
          message: MESSAGES.ACCOUNTS.PARENT_NOT_FOUND,
        };
      }
    }

    const account = await prisma.account.create({
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        type: data.type,
        parentId: data.parentId || null,
      },
    });

    return {
      success: true,
      message: MESSAGES.ACCOUNTS.CREATED_SUCCESS,
      data: account,
    };
  } catch (error) {
    logError({ error, where: "createAccount" });
    return {
      success: false,
      message: MESSAGES.ACCOUNTS.CREATED_ERROR,
    };
  }
}

export async function updateAccount(
  data: UpdateAccountSchema,
): ActionResponse<AccountResponse> {
  try {
    if (!data.id || !data.id.trim()) {
      return {
        success: false,
        message: "ID é obrigatório",
      };
    }

    if (!data.name || !data.name.trim()) {
      return {
        success: false,
        message: MESSAGES.ACCOUNTS.NAME_REQUIRED,
      };
    }

    // Verificar se a conta existe
    const existingAccount = await validateAccountExists(data.id);
    if (!existingAccount) {
      return {
        success: false,
        message: MESSAGES.ACCOUNTS.NOT_FOUND,
      };
    }

    // Validar conta pai se fornecida
    if (data.parentId) {
      const parentExists = await validateParentAccount(data.parentId);
      if (!parentExists) {
        return {
          success: false,
          message: MESSAGES.ACCOUNTS.PARENT_NOT_FOUND,
        };
      }

      // Verificar referência circular
      const isValidHierarchy = await checkCircularReference(data.id, data.parentId);
      if (!isValidHierarchy) {
        return {
          success: false,
          message: MESSAGES.ACCOUNTS.CIRCULAR_REFERENCE,
        };
      }
    }

    const account = await prisma.account.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        type: data.type,
        parentId: data.parentId || null,
      },
    });

    return {
      success: true,
      message: MESSAGES.ACCOUNTS.UPDATED_SUCCESS,
      data: account,
    };
  } catch (error) {
    logError({ error, where: "updateAccount" });
    return {
      success: false,
      message: MESSAGES.ACCOUNTS.UPDATED_ERROR,
    };
  }
}

export async function deleteAccount(id: string): ActionResponse<void> {
  try {
    if (!id || !id.trim()) {
      return {
        success: false,
        message: "ID é obrigatório",
      };
    }

    // Verificar se a conta existe
    const existingAccount = await validateAccountExists(id);
    if (!existingAccount) {
      return {
        success: false,
        message: MESSAGES.ACCOUNTS.NOT_FOUND,
      };
    }

    // Verificar se há contas filhas
    const childrenCount = await prisma.account.count({
      where: { parentId: id, deletedAt: null },
    });

    if (childrenCount > 0) {
      return {
        success: false,
        message: "Não é possível excluir uma conta que possui contas filhas",
      };
    }

    // Verificar se há categorias associadas
    const categoriesCount = await prisma.category.count({
      where: { accountId: id, deletedAt: null },
    });

    if (categoriesCount > 0) {
      return {
        success: false,
        message: "Não é possível excluir uma conta que possui categorias associadas",
      };
    }

    // Soft delete
    await prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: MESSAGES.ACCOUNTS.DELETED_SUCCESS,
    };
  } catch (error) {
    logError({ error, where: "deleteAccount" });
    return {
      success: false,
      message: MESSAGES.ACCOUNTS.DELETED_ERROR,
    };
  }
}
