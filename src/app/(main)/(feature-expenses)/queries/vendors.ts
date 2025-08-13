"use client";

import { useQuery } from "@tanstack/react-query";
import type { Meta, UseQueryOptions } from "@/types/generics";
import { getVendors } from "../server/vendors";

export const USE_GET_VENDORS_KEY = ["useGetVendors"];

export function useGetVendors(params?: {
  meta?: Meta;
  filters?: {
    search?: string;
    active?: boolean;
  };
  options?: UseQueryOptions;
}) {
  const { meta, filters, options } = params ?? {};
  const metaQuery = meta ?? {
    page: 1,
    limit: 100,
  };

  return useQuery({
    queryKey: [...USE_GET_VENDORS_KEY, metaQuery, filters],
    queryFn: async () => {
      const response = await getVendors({ meta: metaQuery, filters });
      return (
        response.data ?? {
          vendors: [],
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
