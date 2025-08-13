"use client";

import { useQuery } from "@tanstack/react-query";
import type { Meta, UseQueryOptions } from "@/types/generics";
import { getAccounts } from "../server/accounts";

export const USE_GET_ACCOUNTS_KEY = ["useGetAccounts"];

export function useGetAccounts(params?: {
  meta?: Meta;
  filters?: {
    search?: string;
    type?: string;
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
    queryKey: [...USE_GET_ACCOUNTS_KEY, metaQuery, filters],
    queryFn: async () => {
      const response = await getAccounts({ meta: metaQuery, filters });
      return (
        response.data ?? {
          accounts: [],
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
