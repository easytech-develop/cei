import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Meta } from "@/types/generics";
import {
  createPermission,
  deletePermission,
  getPermissions,
  getRolePermissions,
  getUserPermissions,
  updatePermission,
  updateRolePermissions,
  updateUserPermissions,
} from "../server/permissions";
import type {
  CreatePermissionSchema,
  ManageRolePermissionsSchema,
  ManageUserPermissionsSchema,
  UpdatePermissionSchema,
} from "../validators/permissions";

// Query Keys
export const USE_GET_PERMISSIONS_KEY = ["permissions", "list"] as const;
export const USE_GET_ROLE_PERMISSIONS_KEY = (roleId: string) =>
  ["permissions", "role", roleId] as const;
export const USE_GET_USER_PERMISSIONS_KEY = (userId: string) =>
  ["permissions", "user", userId] as const;

// Hook para listar permissões
export function useGetPermissions({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    resource?: string;
    action?: string;
  };
}) {
  return useQuery({
    queryKey: [...USE_GET_PERMISSIONS_KEY, meta, filters],
    queryFn: () => getPermissions({ meta, filters }),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para criar permissão
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionSchema) => createPermission(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: USE_GET_PERMISSIONS_KEY });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erro interno ao criar permissão");
    },
  });
}

// Hook para atualizar permissão
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePermissionSchema) => updatePermission(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: USE_GET_PERMISSIONS_KEY });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erro interno ao atualizar permissão");
    },
  });
}

// Hook para excluir permissão
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePermission(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: USE_GET_PERMISSIONS_KEY });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erro interno ao excluir permissão");
    },
  });
}

// Hook para obter permissões de um função
export function useGetRolePermissions(roleId: string) {
  return useQuery({
    queryKey: USE_GET_ROLE_PERMISSIONS_KEY(roleId),
    queryFn: () => getRolePermissions(roleId),
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para atualizar permissões de um função
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ManageRolePermissionsSchema) =>
      updateRolePermissions(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: USE_GET_ROLE_PERMISSIONS_KEY(variables.roleId),
        });
        // Invalida também a lista de funções para atualizar contadores
        queryClient.invalidateQueries({ queryKey: ["roles", "list"] });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erro interno ao atualizar permissões do função");
    },
  });
}

// Hook para obter permissões de um usuário
export function useGetUserPermissions(userId: string) {
  return useQuery({
    queryKey: USE_GET_USER_PERMISSIONS_KEY(userId),
    queryFn: () => getUserPermissions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para atualizar permissões de um usuário
export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ManageUserPermissionsSchema) =>
      updateUserPermissions(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: USE_GET_USER_PERMISSIONS_KEY(variables.userId),
        });
        // Invalida também a lista de usuários para atualizar contadores
        queryClient.invalidateQueries({ queryKey: ["users", "list"] });
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erro interno ao atualizar permissões do usuário");
    },
  });
}
