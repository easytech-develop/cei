"use client";

import { useQuery } from "@tanstack/react-query";
import type { Meta, UseQueryOptions } from "@/types/generics";
import { getUsers } from "../server/users";

export const USE_GET_USERS_KEY = ["useGetUsers"];

export function useGetUsers(params?: {
  meta?: Meta;
  filters?: {
    search?: string;
    roles?: string[];
  };
  options?: UseQueryOptions;
}) {
  const { meta, filters, options } = params ?? {};
  const metaQuery = meta ?? {
    page: 1,
    limit: 100,
  };

  return useQuery({
    queryKey: [...USE_GET_USERS_KEY, metaQuery, filters],
    queryFn: async () => {
      const response = await getUsers({ meta: metaQuery, filters });
      return (
        response.data ?? {
          users: [],
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
