"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Meta, UseQueryOptions } from "@/types/generics";
import { createRole, deleteRole, getRoles, updateRole } from "../server/roles";

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

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USE_GET_ROLES_KEY });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USE_GET_ROLES_KEY });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USE_GET_ROLES_KEY });
    },
  });
}
