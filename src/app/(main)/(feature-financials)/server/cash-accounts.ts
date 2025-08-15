"use server";

import type { CashAccount, CashAccountType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type {
  CreateCashAccountSchema,
  UpdateCashAccountSchema,
} from "@/app/(main)/(feature-financials)/validators/cash-accounts";
import { logError, parseCurrencyToDecimal } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { CashAccountResponse } from "../types/cash-accounts";

const MESSAGES = {
  CASH_ACCOUNTS: {
    LISTED_SUCCESS: "Contas bancárias listadas com sucesso",
    LIST_ERROR: "Erro ao listar contas bancárias",
    CREATED_SUCCESS: "Conta bancária criada com sucesso",
    CREATED_ERROR: "Erro ao criar conta bancária",
    UPDATED_SUCCESS: "Conta bancária atualizada com sucesso",
    UPDATED_ERROR: "Erro ao atualizar conta bancária",
    DELETED_SUCCESS: "Conta bancária excluída com sucesso",
    DELETED_ERROR: "Erro ao excluir conta bancária",
    NOT_FOUND: "Conta bancária não encontrada",
    NAME_REQUIRED: "Nome é obrigatório",
    ACCOUNT_NOT_FOUND: "Conta contábil não encontrada",
  },
} as const;

const validateCashAccountExists = async (
  id: string,
): Promise<CashAccount | null> => {
  const cashAccount = await prisma.cashAccount.findUnique({
    where: { id },
  });
  return cashAccount;
};

const validateAccountExists = async (accountId: string): Promise<boolean> => {
  if (!accountId) return true;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });
  return !!account;
};

export async function getCashAccounts({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    type?: CashAccountType;
    isActive?: boolean;
  };
}): ActionResponse<{
  cashAccounts: CashAccountResponse[];
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

    const where: Prisma.CashAccountWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: "insensitive" } },
        { agency: { contains: filters.search.trim(), mode: "insensitive" } },
        {
          accountNumber: {
            contains: filters.search.trim(),
            mode: "insensitive",
          },
        },
        { pixKey: { contains: filters.search.trim(), mode: "insensitive" } },
      ];
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Executar consultas em paralelo para melhor performance
    const [cashAccounts, total] = await Promise.all([
      prisma.cashAccount.findMany({
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
      prisma.cashAccount.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.CASH_ACCOUNTS.LISTED_SUCCESS,
      data: {
        cashAccounts: cashAccounts.map((cashAccount) => ({
          id: cashAccount.id,
          name: cashAccount.name,
          type: cashAccount.type,
          agency: cashAccount.agency,
          accountNumber: cashAccount.accountNumber,
          pixKey: cashAccount.pixKey,
          accountId: cashAccount.accountId,
          openingBalance: cashAccount.openingBalance.toString(),
          isActive: cashAccount.isActive,
          createdAt: cashAccount.createdAt,
          updatedAt: cashAccount.updatedAt,
          deletedAt: cashAccount.deletedAt,
        })),
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getCashAccounts" });
    return { success: false, message: MESSAGES.CASH_ACCOUNTS.LIST_ERROR };
  }
}

export async function getCashAccountById(id: string): ActionResponse<{
  cashAccount: CashAccountResponse;
}> {
  try {
    if (!id?.trim()) {
      return { success: false, message: "ID da conta bancária é obrigatório" };
    }

    const cashAccount = await prisma.cashAccount.findUnique({
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

    if (!cashAccount) {
      return { success: false, message: MESSAGES.CASH_ACCOUNTS.NOT_FOUND };
    }

    return {
      success: true,
      message: "Conta bancária encontrada com sucesso",
      data: {
        cashAccount: {
          id: cashAccount.id,
          name: cashAccount.name,
          type: cashAccount.type,
          agency: cashAccount.agency,
          accountNumber: cashAccount.accountNumber,
          pixKey: cashAccount.pixKey,
          accountId: cashAccount.accountId,
          openingBalance: cashAccount.openingBalance.toString(),
          isActive: cashAccount.isActive,
          createdAt: cashAccount.createdAt,
          updatedAt: cashAccount.updatedAt,
          deletedAt: cashAccount.deletedAt,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getCashAccountById" });
    return { success: false, message: "Erro ao buscar conta bancária" };
  }
}

export async function createCashAccount(
  data: CreateCashAccountSchema,
): ActionResponse<{
  cashAccount: CashAccountResponse;
}> {
  try {
    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.CASH_ACCOUNTS.NAME_REQUIRED };
    }

    // Validar se a conta contábil existe
    if (data.accountId) {
      const accountExists = await validateAccountExists(data.accountId);
      if (!accountExists) {
        return {
          success: false,
          message: MESSAGES.CASH_ACCOUNTS.ACCOUNT_NOT_FOUND,
        };
      }
    }

    const cashAccount = await prisma.cashAccount.create({
      data: {
        name: data.name.trim(),
        type: data.type,
        agency: data.agency?.trim() || null,
        accountNumber: data.accountNumber?.trim() || null,
        pixKey: data.pixKey?.trim() || null,
        accountId: data.accountId || null,
        openingBalance: new Prisma.Decimal(
          parseCurrencyToDecimal(data.openingBalance),
        ),
        isActive: data.isActive,
      },
    });

    return {
      success: true,
      message: MESSAGES.CASH_ACCOUNTS.CREATED_SUCCESS,
      data: {
        cashAccount: {
          ...cashAccount,
          openingBalance: cashAccount.openingBalance.toString(),
        },
      },
    };
  } catch (error) {
    logError({ error, where: "createCashAccount" });
    return { success: false, message: MESSAGES.CASH_ACCOUNTS.CREATED_ERROR };
  }
}

export async function updateCashAccount(
  data: UpdateCashAccountSchema,
): ActionResponse<{
  cashAccount: CashAccountResponse;
}> {
  try {
    // Validações
    if (!data.id.trim()) {
      return { success: false, message: "ID da conta bancária é obrigatório" };
    }

    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.CASH_ACCOUNTS.NAME_REQUIRED };
    }

    // Verificar se a conta bancária existe
    const existingCashAccount = await validateCashAccountExists(data.id);
    if (!existingCashAccount) {
      return { success: false, message: MESSAGES.CASH_ACCOUNTS.NOT_FOUND };
    }

    // Validar se a conta contábil existe
    if (data.accountId) {
      const accountExists = await validateAccountExists(data.accountId);
      if (!accountExists) {
        return {
          success: false,
          message: MESSAGES.CASH_ACCOUNTS.ACCOUNT_NOT_FOUND,
        };
      }
    }

    const cashAccount = await prisma.cashAccount.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        type: data.type,
        agency: data.agency?.trim() || null,
        accountNumber: data.accountNumber?.trim() || null,
        pixKey: data.pixKey?.trim() || null,
        accountId: data.accountId || null,
        openingBalance: new Prisma.Decimal(
          parseCurrencyToDecimal(data.openingBalance),
        ),
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: MESSAGES.CASH_ACCOUNTS.UPDATED_SUCCESS,
      data: {
        cashAccount: {
          ...cashAccount,
          openingBalance: cashAccount.openingBalance.toString(),
        },
      },
    };
  } catch (error) {
    logError({ error, where: "updateCashAccount" });
    return { success: false, message: MESSAGES.CASH_ACCOUNTS.UPDATED_ERROR };
  }
}

export async function deleteCashAccount(id: string): ActionResponse<{
  cashAccount: CashAccount;
}> {
  try {
    // Validação
    if (!id?.trim()) {
      return { success: false, message: "ID da conta bancária é obrigatório" };
    }

    // Verificar se a conta bancária existe
    const existingCashAccount = await validateCashAccountExists(id);
    if (!existingCashAccount) {
      return { success: false, message: MESSAGES.CASH_ACCOUNTS.NOT_FOUND };
    }

    // Verificar se já está deletado
    if (existingCashAccount.deletedAt) {
      return { success: false, message: "Conta bancária já foi excluída" };
    }

    const cashAccount = await prisma.cashAccount.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: MESSAGES.CASH_ACCOUNTS.DELETED_SUCCESS,
      data: { cashAccount },
    };
  } catch (error) {
    logError({ error, where: "deleteCashAccount" });
    return { success: false, message: MESSAGES.CASH_ACCOUNTS.DELETED_ERROR };
  }
}
