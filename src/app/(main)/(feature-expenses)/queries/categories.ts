"use client";

import { useQuery } from "@tanstack/react-query";
import type { Meta, UseQueryOptions } from "@/types/generics";
import { getCategories } from "../server/categories";

export const USE_GET_CATEGORIES_KEY = ["useGetCategories"];

export function useGetCategories(params?: {
  meta?: Meta;
  filters?: {
    search?: string;
    parentId?: string;
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
