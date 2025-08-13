"use server";

import type { Expense, Prisma } from "@prisma/client";
import type {
  CreateExpenseSchema,
  UpdateExpenseSchema,
} from "@/app/(main)/(feature-expenses)/validators/expenses";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { ExpenseWithRelations } from "../types/expenses";

const MESSAGES = {
  EXPENSES: {
    LISTED_SUCCESS: "Despesas listadas com sucesso",
    LIST_ERROR: "Erro ao listar despesas",
    CREATED_SUCCESS: "Despesa criada com sucesso",
    CREATED_ERROR: "Erro ao criar despesa",
    UPDATED_SUCCESS: "Despesa atualizada com sucesso",
    UPDATED_ERROR: "Erro ao atualizar despesa",
    DELETED_SUCCESS: "Despesa excluída com sucesso",
    DELETED_ERROR: "Erro ao excluir despesa",
    NOT_FOUND: "Despesa não encontrada",
    VENDOR_REQUIRED: "Fornecedor é obrigatório",
    CATEGORY_REQUIRED: "Categoria é obrigatória",
    ITEMS_REQUIRED: "Pelo menos um item é obrigatório",
    INSTALLMENTS_REQUIRED: "Pelo menos uma parcela é obrigatória",
    FETCHED_SUCCESS: "Despesa encontrada com sucesso",
    FETCH_ERROR: "Erro ao buscar despesa",
  },
  PAYMENTS: {
    CREATED_SUCCESS: "Pagamento registrado com sucesso",
    CREATED_ERROR: "Erro ao registrar pagamento",
    UPDATED_SUCCESS: "Pagamento atualizado com sucesso",
    UPDATED_ERROR: "Erro ao atualizar pagamento",
    DELETED_SUCCESS: "Pagamento excluído com sucesso",
    DELETED_ERROR: "Erro ao excluir pagamento",
    NOT_FOUND: "Pagamento não encontrado",
    INSTALLMENT_NOT_FOUND: "Parcela não encontrada",
    ACCOUNT_NOT_FOUND: "Conta não encontrada",
    AMOUNT_EXCEEDS: "Valor do pagamento excede o valor da parcela",
  },
  ATTACHMENTS: {
    CREATED_SUCCESS: "Anexo adicionado com sucesso",
    CREATED_ERROR: "Erro ao adicionar anexo",
    DELETED_SUCCESS: "Anexo excluído com sucesso",
    DELETED_ERROR: "Erro ao excluir anexo",
    NOT_FOUND: "Anexo não encontrado",
  },
} as const;

const validateExpenseExists = async (id: string): Promise<Expense | null> => {
  const expense = await prisma.expense.findUnique({
    where: { id },
  });
  return expense;
};

const validateVendorExists = async (vendorId: string): Promise<boolean> => {
  const vendor = await prisma.vendor.findFirst({
    where: { id: vendorId, deletedAt: null },
  });
  return !!vendor;
};

const validateCategoryExists = async (categoryId: string): Promise<boolean> => {
  const category = await prisma.expenseCategory.findFirst({
    where: { id: categoryId, deletedAt: null },
  });
  return !!category;
};

export async function getExpenses({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    status?: string;
    vendorId?: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
  };
}): ActionResponse<{
  expenses: ExpenseWithRelations[];
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

    const where: Prisma.ExpenseWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        {
          description: { contains: filters.search.trim(), mode: "insensitive" },
        },
      ];
    }

    if (filters?.status) {
      where.status = filters.status as any;
    }

    if (filters?.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.competenceDate = {};
      if (filters.startDate) {
        where.competenceDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.competenceDate.lte = filters.endDate;
      }
    }

    // Executar consultas em paralelo para melhor performance
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        include: {
          Vendor: true,
          Category: true,
          Items: {
            where: { deletedAt: null },
          },
          Installments: {
            where: { deletedAt: null },
            orderBy: { number: "asc" },
            include: {
              Payments: {
                where: { deletedAt: null },
                include: {
                  Account: true,
                },
              },
            },
          },
          Attachments: {
            where: { deletedAt: null },
          },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.EXPENSES.LISTED_SUCCESS,
      data: {
        expenses,
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getExpenses" });
    return { success: false, message: MESSAGES.EXPENSES.LIST_ERROR };
  }
}

export async function createExpense(data: CreateExpenseSchema): ActionResponse<{
  expense: Expense;
}> {
  try {
    if (!data.vendorId) {
      return { success: false, message: MESSAGES.EXPENSES.VENDOR_REQUIRED };
    }

    if (!data.categoryId) {
      return { success: false, message: MESSAGES.EXPENSES.CATEGORY_REQUIRED };
    }

    if (!data.items || data.items.length === 0) {
      return { success: false, message: MESSAGES.EXPENSES.ITEMS_REQUIRED };
    }

    if (!data.installments || data.installments.length === 0) {
      return {
        success: false,
        message: MESSAGES.EXPENSES.INSTALLMENTS_REQUIRED,
      };
    }

    // Validar se fornecedor existe
    const vendorExists = await validateVendorExists(data.vendorId);
    if (!vendorExists) {
      return { success: false, message: "Fornecedor não encontrado" };
    }

    // Validar se categoria existe
    const categoryExists = await validateCategoryExists(data.categoryId);
    if (!categoryExists) {
      return { success: false, message: "Categoria não encontrada" };
    }

    // Criar despesa com transação
    const expense = await prisma.$transaction(async (tx) => {
      // Criar despesa
      const expense = await tx.expense.create({
        data: {
          vendorId: data.vendorId,
          categoryId: data.categoryId,
          description: data.description,
          competenceDate: data.competenceDate,
          issueDate: data.issueDate,
          totalNet: data.totalNet,
          status: data.status,
        },
      });

      // Criar itens
      await tx.expenseItem.createMany({
        data: data.items.map((item) => ({
          expenseId: expense.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total,
        })),
      });

      // Criar parcelas
      await tx.expenseInstallment.createMany({
        data: data.installments.map((installment) => ({
          expenseId: expense.id,
          number: installment.number,
          dueDate: installment.dueDate,
          amount: installment.amount,
          status: installment.status,
        })),
      });

      return expense;
    });

    return {
      success: true,
      message: MESSAGES.EXPENSES.CREATED_SUCCESS,
      data: { expense },
    };
  } catch (error) {
    logError({ error, where: "createExpense" });
    return { success: false, message: MESSAGES.EXPENSES.CREATED_ERROR };
  }
}

export async function updateExpense(data: UpdateExpenseSchema): ActionResponse<{
  expense: Expense;
}> {
  try {
    const existingExpense = await validateExpenseExists(data.id);
    if (!existingExpense) {
      return { success: false, message: MESSAGES.EXPENSES.NOT_FOUND };
    }

    if (!data.vendorId) {
      return { success: false, message: MESSAGES.EXPENSES.VENDOR_REQUIRED };
    }

    if (!data.categoryId) {
      return { success: false, message: MESSAGES.EXPENSES.CATEGORY_REQUIRED };
    }

    if (!data.items || data.items.length === 0) {
      return { success: false, message: MESSAGES.EXPENSES.ITEMS_REQUIRED };
    }

    if (!data.installments || data.installments.length === 0) {
      return {
        success: false,
        message: MESSAGES.EXPENSES.INSTALLMENTS_REQUIRED,
      };
    }

    // Validar se fornecedor existe
    const vendorExists = await validateVendorExists(data.vendorId);
    if (!vendorExists) {
      return { success: false, message: "Fornecedor não encontrado" };
    }

    // Validar se categoria existe
    const categoryExists = await validateCategoryExists(data.categoryId);
    if (!categoryExists) {
      return { success: false, message: "Categoria não encontrada" };
    }

    // Atualizar despesa com transação
    const expense = await prisma.$transaction(async (tx) => {
      // Atualizar despesa
      const expense = await tx.expense.update({
        where: { id: data.id },
        data: {
          vendorId: data.vendorId,
          categoryId: data.categoryId,
          description: data.description,
          competenceDate: data.competenceDate,
          issueDate: data.issueDate,
          totalNet: data.totalNet,
          status: data.status,
        },
      });

      // Deletar itens existentes
      await tx.expenseItem.updateMany({
        where: { expenseId: data.id },
        data: { deletedAt: new Date() },
      });

      // Criar novos itens
      await tx.expenseItem.createMany({
        data: data.items.map((item) => ({
          expenseId: expense.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: item.total,
        })),
      });

      // Deletar parcelas existentes
      await tx.expenseInstallment.updateMany({
        where: { expenseId: data.id },
        data: { deletedAt: new Date() },
      });

      // Criar novas parcelas
      await tx.expenseInstallment.createMany({
        data: data.installments.map((installment) => ({
          expenseId: expense.id,
          number: installment.number,
          dueDate: installment.dueDate,
          amount: installment.amount,
          status: installment.status,
        })),
      });

      return expense;
    });

    return {
      success: true,
      message: MESSAGES.EXPENSES.UPDATED_SUCCESS,
      data: { expense },
    };
  } catch (error) {
    logError({ error, where: "updateExpense" });
    return { success: false, message: MESSAGES.EXPENSES.UPDATED_ERROR };
  }
}

export async function deleteExpense(id: string): ActionResponse<{
  expense: Expense;
}> {
  try {
    const existingExpense = await validateExpenseExists(id);
    if (!existingExpense) {
      return { success: false, message: MESSAGES.EXPENSES.NOT_FOUND };
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: MESSAGES.EXPENSES.DELETED_SUCCESS,
      data: { expense },
    };
  } catch (error) {
    logError({ error, where: "deleteExpense" });
    return { success: false, message: MESSAGES.EXPENSES.DELETED_ERROR };
  }
}

export async function getExpenseById(id: string): ActionResponse<{
  expense: ExpenseWithRelations;
}> {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id, deletedAt: null },
      include: {
        Vendor: true,
        Category: true,
        Items: {
          where: { deletedAt: null },
        },
        Installments: {
          where: { deletedAt: null },
          orderBy: { number: "asc" },
          include: {
            Payments: {
              where: { deletedAt: null },
              include: {
                Account: true,
              },
            },
          },
        },
        Attachments: {
          where: { deletedAt: null },
        },
      },
    });

    if (!expense) {
      return { success: false, message: MESSAGES.EXPENSES.NOT_FOUND };
    }

    return {
      success: true,
      message: MESSAGES.EXPENSES.FETCHED_SUCCESS,
      data: { expense },
    };
  } catch (error) {
    logError({ error, where: "getExpenseById" });
    return { success: false, message: MESSAGES.EXPENSES.FETCH_ERROR };
  }
}

// Server actions para pagamentos
export async function createPayment(data: {
  installmentId: string;
  paidAt: Date;
  amount: number;
  accountId: string;
  paymentMethod: "PIX" | "TED" | "DOC" | "BOLETO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "DINHEIRO" | "CHEQUE";
  note?: string;
}): ActionResponse<{
  payment: any;
  updatedInstallment: any;
}> {
  try {
    // Validar se a parcela existe
    const installment = await prisma.expenseInstallment.findFirst({
      where: { id: data.installmentId, deletedAt: null },
      include: {
        Payments: {
          where: { deletedAt: null },
        },
      },
    });

    if (!installment) {
      return { success: false, message: MESSAGES.PAYMENTS.INSTALLMENT_NOT_FOUND };
    }

    // Validar se a conta existe
    const account = await prisma.account.findFirst({
      where: { id: data.accountId, deletedAt: null },
    });

    if (!account) {
      return { success: false, message: MESSAGES.PAYMENTS.ACCOUNT_NOT_FOUND };
    }

    // Calcular total já pago
    const totalPaid = installment.Payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const remainingAmount = Number(installment.amount) - totalPaid;

    // Validar se o valor não excede o restante
    if (data.amount > remainingAmount) {
      return { success: false, message: MESSAGES.PAYMENTS.AMOUNT_EXCEEDS };
    }

    // Criar pagamento e atualizar status da parcela
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.expensePayment.create({
        data: {
          installmentId: data.installmentId,
          paidAt: data.paidAt,
          amount: data.amount,
          accountId: data.accountId,
          paymentMethod: data.paymentMethod,
          note: data.note?.trim(),
        },
        include: {
          Account: true,
        },
      });

      // Calcular novo total pago
      const newTotalPaid = totalPaid + data.amount;
      const newStatus = newTotalPaid >= Number(installment.amount) ? "PAID" : "PARTIAL";

      // Atualizar status da parcela
      const updatedInstallment = await tx.expenseInstallment.update({
        where: { id: data.installmentId },
        data: { status: newStatus },
        include: {
          Payments: {
            where: { deletedAt: null },
            include: {
              Account: true,
            },
          },
        },
      });

      return { payment, updatedInstallment };
    });

    return {
      success: true,
      message: MESSAGES.PAYMENTS.CREATED_SUCCESS,
      data: result,
    };
  } catch (error) {
    logError({ error, where: "createPayment" });
    return { success: false, message: MESSAGES.PAYMENTS.CREATED_ERROR };
  }
}

export async function deletePayment(id: string): ActionResponse<{
  payment: any;
  updatedInstallment: any;
}> {
  try {
    const payment = await prisma.expensePayment.findFirst({
      where: { id, deletedAt: null },
      include: {
        Installment: {
          include: {
            Payments: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!payment) {
      return { success: false, message: MESSAGES.PAYMENTS.NOT_FOUND };
    }

    const result = await prisma.$transaction(async (tx) => {
      // Marcar pagamento como deletado
      const deletedPayment = await tx.expensePayment.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // Recalcular status da parcela
      const remainingPayments = payment.Installment.Payments.filter(p => p.id !== id);
      const totalPaid = remainingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const newStatus = totalPaid >= Number(payment.Installment.amount) ? "PAID" : totalPaid > 0 ? "PARTIAL" : "PENDING";

      const updatedInstallment = await tx.expenseInstallment.update({
        where: { id: payment.installmentId },
        data: { status: newStatus },
        include: {
          Payments: {
            where: { deletedAt: null },
            include: {
              Account: true,
            },
          },
        },
      });

      return { payment: deletedPayment, updatedInstallment };
    });

    return {
      success: true,
      message: MESSAGES.PAYMENTS.DELETED_SUCCESS,
      data: result,
    };
  } catch (error) {
    logError({ error, where: "deletePayment" });
    return { success: false, message: MESSAGES.PAYMENTS.DELETED_ERROR };
  }
}

// Server actions para anexos
export async function createAttachment(data: {
  expenseId: string;
  fileKey: string;
  fileName: string;
  mimeType?: string;
  size?: number;
}): ActionResponse<{
  attachment: any;
}> {
  try {
    // Validar se a despesa existe
    const expense = await prisma.expense.findFirst({
      where: { id: data.expenseId, deletedAt: null },
    });

    if (!expense) {
      return { success: false, message: MESSAGES.EXPENSES.NOT_FOUND };
    }

    const attachment = await prisma.expenseAttachment.create({
      data: {
        expenseId: data.expenseId,
        fileKey: data.fileKey,
        fileName: data.fileName,
        mimeType: data.mimeType,
        size: data.size,
      },
    });

    return {
      success: true,
      message: MESSAGES.ATTACHMENTS.CREATED_SUCCESS,
      data: { attachment },
    };
  } catch (error) {
    logError({ error, where: "createAttachment" });
    return { success: false, message: MESSAGES.ATTACHMENTS.CREATED_ERROR };
  }
}

export async function deleteAttachment(id: string): ActionResponse<{
  attachment: any;
}> {
  try {
    const attachment = await prisma.expenseAttachment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!attachment) {
      return { success: false, message: MESSAGES.ATTACHMENTS.NOT_FOUND };
    }

    const deletedAttachment = await prisma.expenseAttachment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: MESSAGES.ATTACHMENTS.DELETED_SUCCESS,
      data: { attachment: deletedAttachment },
    };
  } catch (error) {
    logError({ error, where: "deleteAttachment" });
    return { success: false, message: MESSAGES.ATTACHMENTS.DELETED_ERROR };
  }
}

// Função para atualizar status da despesa baseado nas parcelas
export async function updateExpenseStatus(expenseId: string): ActionResponse<{
  expense: Expense;
}> {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, deletedAt: null },
      include: {
        Installments: {
          where: { deletedAt: null },
        },
      },
    });

    if (!expense) {
      return { success: false, message: MESSAGES.EXPENSES.NOT_FOUND };
    }

    const totalInstallments = expense.Installments.length;
    const paidInstallments = expense.Installments.filter(i => i.status === "PAID").length;
    const partialInstallments = expense.Installments.filter(i => i.status === "PARTIAL").length;
    const cancelledInstallments = expense.Installments.filter(i => i.status === "CANCELLED").length;

    let newStatus: "DRAFT" | "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";

    if (cancelledInstallments === totalInstallments) {
      newStatus = "CANCELLED";
    } else if (paidInstallments === totalInstallments) {
      newStatus = "PAID";
    } else if (paidInstallments > 0 || partialInstallments > 0) {
      newStatus = "PARTIALLY_PAID";
    } else {
      newStatus = "OPEN";
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: { status: newStatus },
    });

    return {
      success: true,
      message: "Status da despesa atualizado com sucesso",
      data: { expense: updatedExpense },
    };
  } catch (error) {
    logError({ error, where: "updateExpenseStatus" });
    return { success: false, message: "Erro ao atualizar status da despesa" };
  }
}

// Função para calcular estatísticas de despesas
export async function getExpenseStats(filters?: {
  startDate?: Date;
  endDate?: Date;
  vendorId?: string;
  categoryId?: string;
}): ActionResponse<{
  stats: {
    totalExpenses: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    overdueCount: number;
  };
}> {
  try {
    const where: Prisma.ExpenseWhereInput = {
      deletedAt: null,
    };

    if (filters?.startDate || filters?.endDate) {
      where.competenceDate = {};
      if (filters.startDate) {
        where.competenceDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.competenceDate.lte = filters.endDate;
      }
    }

    if (filters?.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    const [expenses, overdueInstallments] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          Installments: {
            where: { deletedAt: null },
          },
        },
      }),
      prisma.expenseInstallment.findMany({
        where: {
          expenseId: { in: await prisma.expense.findMany({ where, select: { id: true } }).then(ids => ids.map(e => e.id)) },
          deletedAt: null,
          dueDate: { lt: new Date() },
          status: { not: "PAID" },
        },
      }),
    ]);

    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.totalNet), 0);

    const paidAmount = expenses
      .filter(expense => expense.status === "PAID")
      .reduce((sum, expense) => sum + Number(expense.totalNet), 0);

    const pendingAmount = expenses
      .filter(expense => expense.status !== "PAID" && expense.status !== "CANCELLED")
      .reduce((sum, expense) => sum + Number(expense.totalNet), 0);

    const overdueAmount = overdueInstallments.reduce((sum, installment) => sum + Number(installment.amount), 0);
    const overdueCount = overdueInstallments.length;

    return {
      success: true,
      message: "Estatísticas calculadas com sucesso",
      data: {
        stats: {
          totalExpenses,
          totalAmount,
          paidAmount,
          pendingAmount,
          overdueAmount,
          overdueCount,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getExpenseStats" });
    return { success: false, message: "Erro ao calcular estatísticas" };
  }
}

// Server actions para gerenciar parcelas
export async function createInstallment(data: {
  expenseId: string;
  number: number;
  dueDate: Date;
  amount: number;
  status?: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
}): ActionResponse<{
  installment: any;
}> {
  try {
    // Validar se a despesa existe
    const expense = await prisma.expense.findFirst({
      where: { id: data.expenseId, deletedAt: null },
    });

    if (!expense) {
      return { success: false, message: MESSAGES.EXPENSES.NOT_FOUND };
    }

    // Verificar se já existe uma parcela com este número
    const existingInstallment = await prisma.expenseInstallment.findFirst({
      where: {
        expenseId: data.expenseId,
        number: data.number,
        deletedAt: null,
      },
    });

    if (existingInstallment) {
      return { success: false, message: "Já existe uma parcela com este número" };
    }

    const installment = await prisma.expenseInstallment.create({
      data: {
        expenseId: data.expenseId,
        number: data.number,
        dueDate: data.dueDate,
        amount: data.amount,
        status: data.status || "PENDING",
      },
    });

    return {
      success: true,
      message: "Parcela criada com sucesso",
      data: { installment },
    };
  } catch (error) {
    logError({ error, where: "createInstallment" });
    return { success: false, message: "Erro ao criar parcela" };
  }
}

export async function updateInstallment(data: {
  id: string;
  number?: number;
  dueDate?: Date;
  amount?: number;
  status?: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
}): ActionResponse<{
  installment: any;
}> {
  try {
    const existingInstallment = await prisma.expenseInstallment.findFirst({
      where: { id: data.id, deletedAt: null },
    });

    if (!existingInstallment) {
      return { success: false, message: "Parcela não encontrada" };
    }

    // Se estiver alterando o número, verificar se já existe
    if (data.number && data.number !== existingInstallment.number) {
      const duplicateInstallment = await prisma.expenseInstallment.findFirst({
        where: {
          expenseId: existingInstallment.expenseId,
          number: data.number,
          deletedAt: null,
          id: { not: data.id },
        },
      });

      if (duplicateInstallment) {
        return { success: false, message: "Já existe uma parcela com este número" };
      }
    }

    const installment = await prisma.expenseInstallment.update({
      where: { id: data.id },
      data: {
        ...(data.number && { number: data.number }),
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.amount && { amount: data.amount }),
        ...(data.status && { status: data.status }),
      },
    });

    return {
      success: true,
      message: "Parcela atualizada com sucesso",
      data: { installment },
    };
  } catch (error) {
    logError({ error, where: "updateInstallment" });
    return { success: false, message: "Erro ao atualizar parcela" };
  }
}

export async function deleteInstallment(id: string): ActionResponse<{
  installment: any;
}> {
  try {
    const existingInstallment = await prisma.expenseInstallment.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingInstallment) {
      return { success: false, message: "Parcela não encontrada" };
    }

    // Verificar se há pagamentos registrados
    const hasPayments = await prisma.expensePayment.findFirst({
      where: {
        installmentId: id,
        deletedAt: null,
      },
    });

    if (hasPayments) {
      return { success: false, message: "Não é possível excluir uma parcela que possui pagamentos registrados" };
    }

    const installment = await prisma.expenseInstallment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: "Parcela excluída com sucesso",
      data: { installment },
    };
  } catch (error) {
    logError({ error, where: "deleteInstallment" });
    return { success: false, message: "Erro ao excluir parcela" };
  }
}

// Server actions para gerenciar itens de despesa
export async function createExpenseItem(data: {
  expenseId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  total: number;
}): ActionResponse<{
  item: any;
}> {
  try {
    // Validar se a despesa existe
    const expense = await prisma.expense.findFirst({
      where: { id: data.expenseId, deletedAt: null },
    });

    if (!expense) {
      return { success: false, message: MESSAGES.EXPENSES.NOT_FOUND };
    }

    const item = await prisma.expenseItem.create({
      data: {
        expenseId: data.expenseId,
        name: data.name.trim(),
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        discount: data.discount || 0,
        total: data.total,
      },
    });

    return {
      success: true,
      message: "Item criado com sucesso",
      data: { item },
    };
  } catch (error) {
    logError({ error, where: "createExpenseItem" });
    return { success: false, message: "Erro ao criar item" };
  }
}

export async function updateExpenseItem(data: {
  id: string;
  name?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  total?: number;
}): ActionResponse<{
  item: any;
}> {
  try {
    const existingItem = await prisma.expenseItem.findFirst({
      where: { id: data.id, deletedAt: null },
    });

    if (!existingItem) {
      return { success: false, message: "Item não encontrado" };
    }

    const item = await prisma.expenseItem.update({
      where: { id: data.id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.quantity && { quantity: data.quantity }),
        ...(data.unitPrice && { unitPrice: data.unitPrice }),
        ...(data.discount !== undefined && { discount: data.discount }),
        ...(data.total && { total: data.total }),
      },
    });

    return {
      success: true,
      message: "Item atualizado com sucesso",
      data: { item },
    };
  } catch (error) {
    logError({ error, where: "updateExpenseItem" });
    return { success: false, message: "Erro ao atualizar item" };
  }
}

export async function deleteExpenseItem(id: string): ActionResponse<{
  item: any;
}> {
  try {
    const existingItem = await prisma.expenseItem.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingItem) {
      return { success: false, message: "Item não encontrado" };
    }

    const item = await prisma.expenseItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: "Item excluído com sucesso",
      data: { item },
    };
  } catch (error) {
    logError({ error, where: "deleteExpenseItem" });
    return { success: false, message: "Erro ao excluir item" };
  }
}

// Função para buscar parcelas vencidas
export async function getOverdueInstallments(filters?: {
  vendorId?: string;
  categoryId?: string;
  daysOverdue?: number;
}): ActionResponse<{
  installments: any[];
}> {
  try {
    const where: Prisma.ExpenseInstallmentWhereInput = {
      deletedAt: null,
      status: { not: "PAID" },
    };

    // Filtrar por dias em atraso
    const daysOverdue = filters?.daysOverdue || 0;
    const overdueDate = new Date();
    overdueDate.setDate(overdueDate.getDate() - daysOverdue);

    where.dueDate = { lt: overdueDate };

    // Filtrar por fornecedor ou categoria através da despesa
    if (filters?.vendorId || filters?.categoryId) {
      where.Expense = {
        deletedAt: null,
        ...(filters.vendorId && { vendorId: filters.vendorId }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
      };
    }

    const installments = await prisma.expenseInstallment.findMany({
      where,
      include: {
        Expense: {
          include: {
            Vendor: true,
            Category: true,
          },
        },
        Payments: {
          where: { deletedAt: null },
          include: {
            Account: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return {
      success: true,
      message: "Parcelas vencidas listadas com sucesso",
      data: { installments },
    };
  } catch (error) {
    logError({ error, where: "getOverdueInstallments" });
    return { success: false, message: "Erro ao listar parcelas vencidas" };
  }
}

// Função para buscar próximos vencimentos
export async function getUpcomingInstallments(filters?: {
  vendorId?: string;
  categoryId?: string;
  daysAhead?: number;
}): ActionResponse<{
  installments: any[];
}> {
  try {
    const where: Prisma.ExpenseInstallmentWhereInput = {
      deletedAt: null,
      status: { not: "PAID" },
    };

    // Filtrar por próximos dias
    const daysAhead = filters?.daysAhead || 30;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysAhead);

    where.dueDate = {
      gte: startDate,
      lte: endDate,
    };

    // Filtrar por fornecedor ou categoria através da despesa
    if (filters?.vendorId || filters?.categoryId) {
      where.Expense = {
        deletedAt: null,
        ...(filters.vendorId && { vendorId: filters.vendorId }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
      };
    }

    const installments = await prisma.expenseInstallment.findMany({
      where,
      include: {
        Expense: {
          include: {
            Vendor: true,
            Category: true,
          },
        },
        Payments: {
          where: { deletedAt: null },
          include: {
            Account: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return {
      success: true,
      message: "Próximos vencimentos listados com sucesso",
      data: { installments },
    };
  } catch (error) {
    logError({ error, where: "getUpcomingInstallments" });
    return { success: false, message: "Erro ao listar próximos vencimentos" };
  }
}
