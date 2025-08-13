"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Meta } from "@/types/generics";
import {
  createAttachment,
  createExpense,
  createExpenseItem,
  createInstallment,
  createPayment,
  deleteAttachment,
  deleteExpense,
  deleteExpenseItem,
  deleteInstallment,
  deletePayment,
  getExpenseById,
  getExpenseStats,
  getExpenses,
  getOverdueInstallments,
  getUpcomingInstallments,
  updateExpense,
  updateExpenseItem,
  updateExpenseStatus,
  updateInstallment,
} from "../server/expenses";
import type { ExpenseFilters, ExpenseStatsFilters } from "../types/expenses";
import type {
  CreateExpenseSchema,
  UpdateExpenseSchema,
} from "../validators/expenses";

// Chaves de cache
export const expenseKeys = {
  all: ["expenses"] as const,
  lists: () => [...expenseKeys.all, "list"] as const,
  list: (filters: ExpenseFilters, meta: Meta) =>
    [...expenseKeys.lists(), filters, meta] as const,
  details: () => [...expenseKeys.all, "detail"] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  stats: (filters?: ExpenseStatsFilters) =>
    [...expenseKeys.all, "stats", filters] as const,
  overdue: (filters?: any) => [...expenseKeys.all, "overdue", filters] as const,
  upcoming: (filters?: any) =>
    [...expenseKeys.all, "upcoming", filters] as const,
};

// Hook para listar despesas
export function useExpenses(filters: ExpenseFilters, meta: Meta) {
  return useQuery({
    queryKey: expenseKeys.list(filters, meta),
    queryFn: () => getExpenses({ meta, filters }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para buscar despesa por ID
export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => getExpenseById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para estatísticas de despesas
export function useExpenseStats(filters?: ExpenseStatsFilters) {
  return useQuery({
    queryKey: expenseKeys.stats(filters),
    queryFn: () => getExpenseStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para parcelas vencidas
export function useOverdueInstallments(filters?: any) {
  return useQuery({
    queryKey: expenseKeys.overdue(filters),
    queryFn: () => getOverdueInstallments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para próximos vencimentos
export function useUpcomingInstallments(filters?: any) {
  return useQuery({
    queryKey: expenseKeys.upcoming(filters),
    queryFn: () => getUpcomingInstallments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para criar despesa
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseSchema) => createExpense(data),
    onSuccess: () => {
      // Invalidar todas as listas de despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
}

// Hook para atualizar despesa
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateExpenseSchema) => updateExpense(data),
    onSuccess: (_, variables) => {
      // Invalidar detalhes da despesa
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.id),
      });
      // Invalidar todas as listas de despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
}

// Hook para excluir despesa
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      // Invalidar todas as listas de despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
}

// Hook para criar pagamento
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      installmentId: string;
      paidAt: Date;
      amount: number;
      accountId: string;
      paymentMethod:
      | "PIX"
      | "TED"
      | "DOC"
      | "BOLETO"
      | "CARTAO_CREDITO"
      | "CARTAO_DEBITO"
      | "DINHEIRO"
      | "CHEQUE";
      note?: string;
    }) => createPayment(data),
    onSuccess: () => {
      // Invalidar todas as consultas relacionadas a despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

// Hook para excluir pagamento
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      // Invalidar todas as consultas relacionadas a despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

// Hook para criar anexo
export function useCreateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      expenseId: string;
      fileKey: string;
      fileName: string;
      mimeType?: string;
      size?: number;
    }) => createAttachment(data),
    onSuccess: (_, variables) => {
      // Invalidar detalhes da despesa
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.expenseId),
      });
    },
  });
}

// Hook para excluir anexo
export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      // Invalidar detalhes de todas as despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.details() });
    },
  });
}

// Hook para atualizar status da despesa
export function useUpdateExpenseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateExpenseStatus(id),
    onSuccess: (_, variables) => {
      // Invalidar detalhes da despesa
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables),
      });
      // Invalidar todas as listas de despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      // Invalidar estatísticas
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
}

// Hook para criar parcela
export function useCreateInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      expenseId: string;
      number: number;
      dueDate: Date;
      amount: number;
      status?: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
    }) => createInstallment(data),
    onSuccess: (_, variables) => {
      // Invalidar detalhes da despesa
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.expenseId),
      });
    },
  });
}

// Hook para atualizar parcela
export function useUpdateInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      number?: number;
      dueDate?: Date;
      amount?: number;
      status?: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
    }) => updateInstallment(data),
    onSuccess: () => {
      // Invalidar detalhes de todas as despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.details() });
    },
  });
}

// Hook para excluir parcela
export function useDeleteInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInstallment(id),
    onSuccess: () => {
      // Invalidar detalhes de todas as despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.details() });
    },
  });
}

// Hook para criar item de despesa
export function useCreateExpenseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      expenseId: string;
      name: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
      total: number;
    }) => createExpenseItem(data),
    onSuccess: (_, variables) => {
      // Invalidar detalhes da despesa
      queryClient.invalidateQueries({
        queryKey: expenseKeys.detail(variables.expenseId),
      });
    },
  });
}

// Hook para atualizar item de despesa
export function useUpdateExpenseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      name?: string;
      quantity?: number;
      unitPrice?: number;
      discount?: number;
      total?: number;
    }) => updateExpenseItem(data),
    onSuccess: () => {
      // Invalidar detalhes de todas as despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.details() });
    },
  });
}

// Hook para excluir item de despesa
export function useDeleteExpenseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpenseItem(id),
    onSuccess: () => {
      // Invalidar detalhes de todas as despesas
      queryClient.invalidateQueries({ queryKey: expenseKeys.details() });
    },
  });
}
