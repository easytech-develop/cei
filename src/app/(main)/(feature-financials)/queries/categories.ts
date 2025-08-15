"use client";

import type { DocumentDirection } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type { Meta } from "@/types/generics";
import { getCategories, getCategoryById } from "../server/categories";

export const USE_GET_CATEGORIES_KEY = ["categories", "list"] as const;
export const USE_GET_CATEGORY_BY_ID_KEY = ["categories", "by-id"] as const;

export function useGetCategories({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    direction?: DocumentDirection;
  };
}) {
  return useQuery({
    queryKey: [...USE_GET_CATEGORIES_KEY, meta, filters],
    queryFn: () => getCategories({ meta, filters }),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useGetCategoryById(id: string) {
  return useQuery({
    queryKey: [...USE_GET_CATEGORY_BY_ID_KEY, id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
