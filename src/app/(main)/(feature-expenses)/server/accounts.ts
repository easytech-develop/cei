"use server";

import type { Account, Prisma } from "@prisma/client";
import type {
  CreateAccountSchema,
  UpdateAccountSchema,
} from "@/app/(main)/(feature-expenses)/validators/accounts";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { AccountWithPayments } from "../types/accounts";

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
  },
} as const;

const validateAccountExists = async (id: string): Promise<Account | null> => {
  const account = await prisma.account.findUnique({
    where: { id },
  });
  return account;
};

export async function getAccounts({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    type?: string;
    active?: boolean;
  };
}): ActionResponse<{
  accounts: AccountWithPayments[];
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
      ];
    }

    if (filters?.type) {
      where.type = filters.type as "CASH" | "BANK";
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    // Executar consultas em paralelo para melhor performance
    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ name: "asc" }],
        include: {
          Payments: {
            where: { deletedAt: null },
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
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getAccounts" });
    return { success: false, message: MESSAGES.ACCOUNTS.LIST_ERROR };
  }
}

export async function createAccount(data: CreateAccountSchema): ActionResponse<{
  account: Account;
}> {
  try {
    if (!data.name?.trim()) {
      return { success: false, message: "Nome é obrigatório" };
    }

    if (!data.type) {
      return { success: false, message: "Tipo é obrigatório" };
    }

    const account = await prisma.account.create({
      data: {
        name: data.name.trim(),
        type: data.type,
        openingBalance: data.openingBalance,
        active: data.active,
      },
    });

    return {
      success: true,
      message: MESSAGES.ACCOUNTS.CREATED_SUCCESS,
      data: { account },
    };
  } catch (error) {
    logError({ error, where: "createAccount" });
    return { success: false, message: MESSAGES.ACCOUNTS.CREATED_ERROR };
  }
}

export async function updateAccount(data: UpdateAccountSchema): ActionResponse<{
  account: Account;
}> {
  try {
    const existingAccount = await validateAccountExists(data.id);
    if (!existingAccount) {
      return { success: false, message: MESSAGES.ACCOUNTS.NOT_FOUND };
    }

    if (!data.name?.trim()) {
      return { success: false, message: "Nome é obrigatório" };
    }

    if (!data.type) {
      return { success: false, message: "Tipo é obrigatório" };
    }

    const account = await prisma.account.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        type: data.type,
        openingBalance: data.openingBalance,
        active: data.active,
      },
    });

    return {
      success: true,
      message: MESSAGES.ACCOUNTS.UPDATED_SUCCESS,
      data: { account },
    };
  } catch (error) {
    logError({ error, where: "updateAccount" });
    return { success: false, message: MESSAGES.ACCOUNTS.UPDATED_ERROR };
  }
}

export async function deleteAccount(id: string): ActionResponse<{
  account: Account;
}> {
  try {
    const existingAccount = await validateAccountExists(id);
    if (!existingAccount) {
      return { success: false, message: MESSAGES.ACCOUNTS.NOT_FOUND };
    }

    const account = await prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: MESSAGES.ACCOUNTS.DELETED_SUCCESS,
      data: { account },
    };
  } catch (error) {
    logError({ error, where: "deleteAccount" });
    return { success: false, message: MESSAGES.ACCOUNTS.DELETED_ERROR };
  }
}
