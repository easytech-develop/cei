"use server";

import type { Prisma, Role } from "@prisma/client";
import type {
  CreateRoleSchema,
  UpdateRoleSchema,
} from "@/app/(main)/(feature-users)/validators/roles";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";

const MESSAGES = {
  ROLES: {
    LISTED_SUCCESS: "Cargos listados com sucesso",
    LIST_ERROR: "Erro ao listar cargos",
    CREATED_SUCCESS: "Cargo criado com sucesso",
    CREATED_ERROR: "Erro ao criar cargo",
    UPDATED_SUCCESS: "Cargo atualizado com sucesso",
    UPDATED_ERROR: "Erro ao atualizar cargo",
    DELETED_SUCCESS: "Cargo excluído com sucesso",
    DELETED_ERROR: "Erro ao excluir cargo",
    NOT_FOUND: "Cargo não encontrado",
    SLUG_EXISTS: "Já existe um cargo com este slug",
    NAME_REQUIRED: "Nome do cargo é obrigatório",
    SLUG_REQUIRED: "Slug do cargo é obrigatório",
  },
} as const;

const validateRoleExists = async (id: string): Promise<Role | null> => {
  const role = await prisma.role.findUnique({
    where: { id },
  });
  return role;
};

const validateSlugUniqueness = async (
  slug: string,
  excludeId?: string,
): Promise<boolean> => {
  const where: Prisma.RoleWhereInput = {
    slug,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existingRole = await prisma.role.findFirst({ where });
  return !existingRole;
};

export async function getRoles({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
  };
}): ActionResponse<{
  roles: Role[];
  meta: Meta;
}> {
  try {
    const { page, limit } = meta;

    if (page < 1 || limit < 1) {
      return { success: false, message: "Parâmetros de paginação inválidos" };
    }

    const where: Prisma.RoleWhereInput = {};

    if (filters?.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: "insensitive" } },
        { slug: { contains: filters.search.trim(), mode: "insensitive" } },
      ];
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.role.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.ROLES.LISTED_SUCCESS,
      data: {
        roles,
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getRoles" });
    return { success: false, message: MESSAGES.ROLES.LIST_ERROR };
  }
}

export async function createRole(data: CreateRoleSchema): ActionResponse<{
  role: Role;
}> {
  try {
    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.ROLES.NAME_REQUIRED };
    }

    if (!data.slug?.trim()) {
      return { success: false, message: MESSAGES.ROLES.SLUG_REQUIRED };
    }

    const slugExists = await validateSlugUniqueness(data.slug.trim());
    if (!slugExists) {
      return { success: false, message: MESSAGES.ROLES.SLUG_EXISTS };
    }

    const role = await prisma.role.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.trim().toUpperCase(),
      },
    });

    return {
      success: true,
      message: MESSAGES.ROLES.CREATED_SUCCESS,
      data: { role },
    };
  } catch (error) {
    logError({ error, where: "createRole" });
    return { success: false, message: MESSAGES.ROLES.CREATED_ERROR };
  }
}

export async function updateRole(
  data: UpdateRoleSchema,
): ActionResponse<{
  role: Role;
}> {
  try {
    if (!data.id.trim()) {
      return { success: false, message: "ID do cargo é obrigatório" };
    }

    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.ROLES.NAME_REQUIRED };
    }

    if (!data.slug?.trim()) {
      return { success: false, message: MESSAGES.ROLES.SLUG_REQUIRED };
    }

    const existingRole = await validateRoleExists(data.id);
    if (!existingRole) {
      return { success: false, message: MESSAGES.ROLES.NOT_FOUND };
    }

    const slugExists = await validateSlugUniqueness(data.slug.trim(), data.id);
    if (!slugExists) {
      return { success: false, message: MESSAGES.ROLES.SLUG_EXISTS };
    }

    const role = await prisma.role.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        slug: data.slug.trim().toUpperCase(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: MESSAGES.ROLES.UPDATED_SUCCESS,
      data: { role },
    };
  } catch (error) {
    logError({ error, where: "updateRole" });
    return { success: false, message: MESSAGES.ROLES.UPDATED_ERROR };
  }
}

export async function deleteRole(id: string): ActionResponse<{
  role: Role;
}> {
  try {
    if (!id?.trim()) {
      return { success: false, message: "ID do cargo é obrigatório" };
    }

    const existingRole = await validateRoleExists(id);
    if (!existingRole) {
      return { success: false, message: MESSAGES.ROLES.NOT_FOUND };
    }

    // Verificar se há usuários associados a este cargo
    const usersWithRole = await prisma.userRole.count({
      where: { roleId: id },
    });

    if (usersWithRole > 0) {
      return {
        success: false,
        message: `Não é possível excluir o cargo. Existem ${usersWithRole} usuário(s) associado(s) a este cargo.`,
      };
    }

    const role = await prisma.role.delete({
      where: { id },
    });

    return {
      success: true,
      message: MESSAGES.ROLES.DELETED_SUCCESS,
      data: { role },
    };
  } catch (error) {
    logError({ error, where: "deleteRole" });
    return { success: false, message: MESSAGES.ROLES.DELETED_ERROR };
  }
}
