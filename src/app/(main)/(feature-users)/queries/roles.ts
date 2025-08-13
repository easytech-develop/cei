"use client";

import { useQuery } from "@tanstack/react-query";
import type { Meta, UseQueryOptions } from "@/types/generics";
import { getRoles } from "../server/roles";

export const USE_GET_ROLES_KEY = ["useGetRoles"];

export function useGetRoles(params?: {
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
    queryKey: [...USE_GET_ROLES_KEY, metaQuery, filters],
    queryFn: async () => {
      const response = await getRoles({ meta: metaQuery, filters });
      return (
        response.data ?? {
          roles: [],
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
