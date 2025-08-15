"use client";

import { useQuery } from "@tanstack/react-query";
import type { Meta, UseQueryOptions } from "@/types/generics";
import { getCostCenters } from "../server/cost-centers";

// Query Keys
export const USE_GET_COST_CENTERS_KEY = ["useGetCostCenters"];

// Query para listar centros de custo com paginação e filtros
export function useGetCostCenters(params?: {
  meta?: Meta;
  filters?: {
    search?: string;
  };
  options?: UseQueryOptions;
}) {
  const { meta, filters, options } = params ?? {};
  const metaQuery = meta ?? {
    page: 1,
    limit: 100,
  };

  return useQuery({
    queryKey: [...USE_GET_COST_CENTERS_KEY, metaQuery, filters],
    queryFn: async () => {
      const response = await getCostCenters({ meta: metaQuery, filters });
      return (
        response.data ?? {
          costCenters: [],
          meta: {
            page: 1,
            limit: 100,
          },
        }
      );
    },
    ...options,
  });
}
