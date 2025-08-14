"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Meta, UseQueryOptions } from "@/types/generics";
import { 
  createCategory, 
  deleteCategory, 
  getCategories, 
  updateCategory 
} from "../server/categories";
import type { CreateCategorySchema, UpdateCategorySchema } from "../validators/categories";

export const USE_GET_CATEGORIES_KEY = ["useGetCategories"];

// Chaves de cache
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: { search?: string; parentId?: string | null | undefined }, meta: Meta) =>
    [...categoryKeys.lists(), filters, meta] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useGetCategories(params?: {
  meta?: Meta;
  filters?: {
    search?: string;
    parentId?: string | null | undefined;
  };
  options?: UseQueryOptions;
}) {
  const { meta, filters, options } = params ?? {};
  const metaQuery = meta ?? {
    page: 1,
    limit: 100,
  };

  return useQuery({
    queryKey: [...USE_GET_CATEGORIES_KEY, metaQuery, filters],
    queryFn: async () => {
      const response = await getCategories({ meta: metaQuery, filters });
      return (
        response.data ?? {
          categories: [],
          meta: {
            page: 1,
            limit: 10,
          },
        }
      );
    },
    ...options,
  });
}

// Hook para criar categoria
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategorySchema) => createCategory(data),
    onSuccess: () => {
      // Invalidar todas as listas de categorias
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      // Invalidar consulta específica de categorias
      queryClient.invalidateQueries({ queryKey: USE_GET_CATEGORIES_KEY });
    },
  });
}

// Hook para atualizar categoria
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategorySchema) => updateCategory(data),
    onSuccess: (_, variables) => {
      // Invalidar detalhes da categoria
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
      // Invalidar todas as listas de categorias
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      // Invalidar consulta específica de categorias
      queryClient.invalidateQueries({ queryKey: USE_GET_CATEGORIES_KEY });
    },
  });
}

// Hook para excluir categoria
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      // Invalidar todas as listas de categorias
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      // Invalidar consulta específica de categorias
      queryClient.invalidateQueries({ queryKey: USE_GET_CATEGORIES_KEY });
    },
  });
}
