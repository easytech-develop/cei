"use server";

import type { Permission, Prisma } from "@prisma/client";
import type {
  CreatePermissionSchema,
  ManageRolePermissionsSchema,
  ManageUserPermissionsSchema,
  UpdatePermissionSchema,
} from "@/app/(main)/(feature-permissions)/validators/permissions";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";

const MESSAGES = {
  PERMISSIONS: {
    LISTED_SUCCESS: "Permissões listadas com sucesso",
    LIST_ERROR: "Erro ao listar permissões",
    CREATED_SUCCESS: "Permissão criada com sucesso",
    CREATED_ERROR: "Erro ao criar permissão",
    UPDATED_SUCCESS: "Permissão atualizada com sucesso",
    UPDATED_ERROR: "Erro ao atualizar permissão",
    DELETED_SUCCESS: "Permissão excluída com sucesso",
    DELETED_ERROR: "Erro ao excluir permissão",
    NOT_FOUND: "Permissão não encontrada",
    CODE_EXISTS: "Já existe uma permissão com este código",
    NAME_REQUIRED: "Nome da permissão é obrigatório",
    RESOURCE_REQUIRED: "Recurso é obrigatório",
    ACTION_REQUIRED: "Ação é obrigatória",
  },
  ROLE_PERMISSIONS: {
    UPDATED_SUCCESS: "Permissões do cargo atualizadas com sucesso",
    UPDATED_ERROR: "Erro ao atualizar permissões do cargo",
    ROLE_NOT_FOUND: "Cargo não encontrado",
  },
  USER_PERMISSIONS: {
    UPDATED_SUCCESS: "Permissões do usuário atualizadas com sucesso",
    UPDATED_ERROR: "Erro ao atualizar permissões do usuário",
    USER_NOT_FOUND: "Usuário não encontrado",
  },
} as const;

const validatePermissionExists = async (
  id: string,
): Promise<Permission | null> => {
  const permission = await prisma.permission.findUnique({
    where: { id },
  });
  return permission;
};

const validateCodeUniqueness = async (
  code: string,
  excludeId?: string,
): Promise<boolean> => {
  const where: Prisma.PermissionWhereInput = {
    code,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existingPermission = await prisma.permission.findFirst({ where });
  return !existingPermission;
};

export async function getPermissions({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    resource?: string;
    action?: string;
  };
}): ActionResponse<{
  permissions: Permission[];
  meta: Meta;
}> {
  try {
    const { page, limit } = meta;

    if (page < 1 || limit < 1) {
      return { success: false, message: "Parâmetros de paginação inválidos" };
    }

    const where: Prisma.PermissionWhereInput = {};

    if (filters?.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: "insensitive" } },
        {
          description: { contains: filters.search.trim(), mode: "insensitive" },
        },
        { resource: { contains: filters.search.trim(), mode: "insensitive" } },
        { action: { contains: filters.search.trim(), mode: "insensitive" } },
      ];
    }

    if (filters?.resource?.trim()) {
      where.resource = {
        contains: filters.resource.trim(),
        mode: "insensitive",
      };
    }

    if (filters?.action?.trim()) {
      where.action = { contains: filters.action.trim(), mode: "insensitive" };
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.permission.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.PERMISSIONS.LISTED_SUCCESS,
      data: {
        permissions,
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getPermissions" });
    return { success: false, message: MESSAGES.PERMISSIONS.LIST_ERROR };
  }
}

export async function createPermission(
  data: CreatePermissionSchema,
): ActionResponse<{
  permission: Permission;
}> {
  try {
    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.PERMISSIONS.NAME_REQUIRED };
    }

    if (!data.resource?.trim()) {
      return {
        success: false,
        message: MESSAGES.PERMISSIONS.RESOURCE_REQUIRED,
      };
    }

    if (!data.action?.trim()) {
      return { success: false, message: MESSAGES.PERMISSIONS.ACTION_REQUIRED };
    }

    const code = `${data.resource.trim()}:${data.action.trim()}`;
    const codeExists = await validateCodeUniqueness(code);
    if (!codeExists) {
      return { success: false, message: MESSAGES.PERMISSIONS.CODE_EXISTS };
    }

    const permission = await prisma.permission.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        resource: data.resource.trim(),
        action: data.action.trim(),
        code,
      },
    });

    return {
      success: true,
      message: MESSAGES.PERMISSIONS.CREATED_SUCCESS,
      data: { permission },
    };
  } catch (error) {
    logError({ error, where: "createPermission" });
    return { success: false, message: MESSAGES.PERMISSIONS.CREATED_ERROR };
  }
}

export async function updatePermission(
  data: UpdatePermissionSchema,
): ActionResponse<{
  permission: Permission;
}> {
  try {
    if (!data.id.trim()) {
      return { success: false, message: "ID da permissão é obrigatório" };
    }

    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.PERMISSIONS.NAME_REQUIRED };
    }

    if (!data.resource?.trim()) {
      return {
        success: false,
        message: MESSAGES.PERMISSIONS.RESOURCE_REQUIRED,
      };
    }

    if (!data.action?.trim()) {
      return { success: false, message: MESSAGES.PERMISSIONS.ACTION_REQUIRED };
    }

    const existingPermission = await validatePermissionExists(data.id);
    if (!existingPermission) {
      return { success: false, message: MESSAGES.PERMISSIONS.NOT_FOUND };
    }

    const code = `${data.resource.trim()}:${data.action.trim()}`;
    const codeExists = await validateCodeUniqueness(code, data.id);
    if (!codeExists) {
      return { success: false, message: MESSAGES.PERMISSIONS.CODE_EXISTS };
    }

    const permission = await prisma.permission.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        resource: data.resource.trim(),
        action: data.action.trim(),
        code,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: MESSAGES.PERMISSIONS.UPDATED_SUCCESS,
      data: { permission },
    };
  } catch (error) {
    logError({ error, where: "updatePermission" });
    return { success: false, message: MESSAGES.PERMISSIONS.UPDATED_ERROR };
  }
}

export async function deletePermission(id: string): ActionResponse<{
  permission: Permission;
}> {
  try {
    if (!id?.trim()) {
      return { success: false, message: "ID da permissão é obrigatório" };
    }

    const existingPermission = await validatePermissionExists(id);
    if (!existingPermission) {
      return { success: false, message: MESSAGES.PERMISSIONS.NOT_FOUND };
    }

    // Verificar se há roles ou usuários associados a esta permissão
    const [rolesWithPermission, usersWithPermission] = await Promise.all([
      prisma.rolePermission.count({
        where: { permissionId: id },
      }),
      prisma.userPermission.count({
        where: { permissionId: id },
      }),
    ]);

    if (rolesWithPermission > 0 || usersWithPermission > 0) {
      return {
        success: false,
        message: `Não é possível excluir a permissão. Existem ${rolesWithPermission} cargo(s) e ${usersWithPermission} usuário(s) associado(s) a esta permissão.`,
      };
    }

    const permission = await prisma.permission.delete({
      where: { id },
    });

    return {
      success: true,
      message: MESSAGES.PERMISSIONS.DELETED_SUCCESS,
      data: { permission },
    };
  } catch (error) {
    logError({ error, where: "deletePermission" });
    return { success: false, message: MESSAGES.PERMISSIONS.DELETED_ERROR };
  }
}

export async function getRolePermissions(roleId: string): ActionResponse<{
  permissions: Permission[];
  assignedPermissionIds: string[];
}> {
  try {
    if (!roleId?.trim()) {
      return { success: false, message: "ID do cargo é obrigatório" };
    }

    const [role, allPermissions] = await Promise.all([
      prisma.role.findUnique({
        where: { id: roleId },
        include: {
          RolePermissions: {
            include: {
              Permission: true,
            },
          },
        },
      }),
      prisma.permission.findMany({
        orderBy: [{ resource: "asc" }, { action: "asc" }],
      }),
    ]);

    if (!role) {
      return {
        success: false,
        message: MESSAGES.ROLE_PERMISSIONS.ROLE_NOT_FOUND,
      };
    }

    const assignedPermissionIds = role.RolePermissions.map(
      (rp) => rp.permissionId,
    );

    return {
      success: true,
      message: "Permissões do cargo carregadas com sucesso",
      data: {
        permissions: allPermissions,
        assignedPermissionIds,
      },
    };
  } catch (error) {
    logError({ error, where: "getRolePermissions" });
    return { success: false, message: "Erro ao carregar permissões do cargo" };
  }
}

export async function updateRolePermissions(
  data: ManageRolePermissionsSchema,
): ActionResponse<{
  roleId: string;
  permissionIds: string[];
}> {
  try {
    if (!data.roleId?.trim()) {
      return { success: false, message: "ID do cargo é obrigatório" };
    }

    const role = await prisma.role.findUnique({
      where: { id: data.roleId },
    });

    if (!role) {
      return {
        success: false,
        message: MESSAGES.ROLE_PERMISSIONS.ROLE_NOT_FOUND,
      };
    }

    // Verificar se todas as permissões existem
    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: data.permissionIds },
      },
    });

    if (permissions.length !== data.permissionIds.length) {
      return {
        success: false,
        message: "Uma ou mais permissões não foram encontradas",
      };
    }

    // Atualizar permissões do cargo em uma transação
    await prisma.$transaction(async (tx) => {
      // Remover todas as permissões atuais
      await tx.rolePermission.deleteMany({
        where: { roleId: data.roleId },
      });

      // Adicionar as novas permissões
      if (data.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: data.permissionIds.map((permissionId) => ({
            roleId: data.roleId,
            permissionId,
          })),
        });
      }
    });

    return {
      success: true,
      message: MESSAGES.ROLE_PERMISSIONS.UPDATED_SUCCESS,
      data: {
        roleId: data.roleId,
        permissionIds: data.permissionIds,
      },
    };
  } catch (error) {
    logError({ error, where: "updateRolePermissions" });
    return { success: false, message: MESSAGES.ROLE_PERMISSIONS.UPDATED_ERROR };
  }
}

export async function getUserPermissions(userId: string): ActionResponse<{
  permissions: Permission[];
  userPermissions: Array<{
    permissionId: string;
    mode: string;
    scopeJson: unknown;
  }>;
}> {
  try {
    if (!userId?.trim()) {
      return { success: false, message: "ID do usuário é obrigatório" };
    }

    const [user, allPermissions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          UserPermissions: {
            include: {
              Permission: true,
            },
          },
        },
      }),
      prisma.permission.findMany({
        orderBy: [{ resource: "asc" }, { action: "asc" }],
      }),
    ]);

    if (!user) {
      return {
        success: false,
        message: MESSAGES.USER_PERMISSIONS.USER_NOT_FOUND,
      };
    }

    const userPermissions = user.UserPermissions.map((up) => ({
      permissionId: up.permissionId,
      mode: up.mode,
      scopeJson: up.scopeJson,
    }));

    return {
      success: true,
      message: "Permissões do usuário carregadas com sucesso",
      data: {
        permissions: allPermissions,
        userPermissions,
      },
    };
  } catch (error) {
    logError({ error, where: "getUserPermissions" });
    return {
      success: false,
      message: "Erro ao carregar permissões do usuário",
    };
  }
}

export async function updateUserPermissions(
  data: ManageUserPermissionsSchema,
): ActionResponse<{
  userId: string;
  permissions: Array<{
    permissionId: string;
    mode: string;
    scopeJson: unknown;
  }>;
}> {
  try {
    if (!data.userId?.trim()) {
      return { success: false, message: "ID do usuário é obrigatório" };
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      return {
        success: false,
        message: MESSAGES.USER_PERMISSIONS.USER_NOT_FOUND,
      };
    }

    // Verificar se todas as permissões existem
    const permissionIds = data.permissions.map((p) => p.permissionId);
    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
      },
    });

    if (permissions.length !== permissionIds.length) {
      return {
        success: false,
        message: "Uma ou mais permissões não foram encontradas",
      };
    }

    // Atualizar permissões do usuário em uma transação
    await prisma.$transaction(async (tx) => {
      // Remover todas as permissões atuais
      await tx.userPermission.deleteMany({
        where: { userId: data.userId },
      });

      // Adicionar as novas permissões
      if (data.permissions.length > 0) {
        await tx.userPermission.createMany({
          data: data.permissions.map((permission) => ({
            userId: data.userId,
            permissionId: permission.permissionId,
            mode: permission.mode,
            scopeJson: permission.scopeJson || null,
          })),
        });
      }
    });

    return {
      success: true,
      message: MESSAGES.USER_PERMISSIONS.UPDATED_SUCCESS,
      data: {
        userId: data.userId,
        permissions: data.permissions.map(p => ({
          permissionId: p.permissionId,
          mode: p.mode,
          scopeJson: p.scopeJson || null,
        })),
      },
    };
  } catch (error) {
    logError({ error, where: "updateUserPermissions" });
    return { success: false, message: MESSAGES.USER_PERMISSIONS.UPDATED_ERROR };
  }
}
