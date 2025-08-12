"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/server/users";
import type { Meta, UseQueryOptions } from "@/types/generics";

export function useGetUsers({
  meta,
  options,
}: {
  meta: Meta;
  options?: UseQueryOptions;
}) {
  return useQuery({
    queryKey: ["useGetUsers", meta],
    queryFn: async () => {
      const response = await getUsers({ meta });
      return response.data ?? {
        users: [],
        meta: {
          page: 1,
          limit: 10,
        },
      };
    },
    ...options,
  });
}
