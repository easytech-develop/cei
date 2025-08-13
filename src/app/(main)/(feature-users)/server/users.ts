"use server";

import type { Prisma, User } from "@prisma/client";
import type {
  CreateUserSchema,
  UpdateUserSchema,
} from "@/app/(main)/(feature-users)/validators/users";
import { hashPassword, logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { UserWithRoles } from "../types/users";

const MESSAGES = {
  USERS: {
    LISTED_SUCCESS: "Usuários listados com sucesso",
    LIST_ERROR: "Erro ao listar usuários",
    CREATED_SUCCESS: "Usuário criado com sucesso",
    CREATED_ERROR: "Erro ao criar usuário",
    UPDATED_SUCCESS: "Usuário atualizado com sucesso",
    UPDATED_ERROR: "Erro ao atualizar usuário",
    DELETED_SUCCESS: "Usuário excluído com sucesso",
    DELETED_ERROR: "Erro ao excluir usuário",
    NOT_FOUND: "Usuário não encontrado",
    EMAIL_EXISTS: "Já existe um usuário com este email",
    ROLE_REQUIRED: "Informe o cargo",
  },
} as const;

const validateUserExists = async (id: string): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
};

const validateEmailUniqueness = async (
  email: string,
  excludeId?: string,
): Promise<boolean> => {
  const where: Prisma.UserWhereInput = {
    email,
    deletedAt: null,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existingUser = await prisma.user.findFirst({ where });
  return !existingUser;
};

export async function getUsers({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    roles?: string[];
  };
}): ActionResponse<{
  users: UserWithRoles[];
  meta: Meta;
}> {
  try {
    const { page, limit } = meta;

    if (page < 1 || limit < 1) {
      return {
        success: false,
        message: "Parâmetros de paginação inválidos",
      };
    }

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: "insensitive" } },
        { email: { contains: filters.search.trim(), mode: "insensitive" } },
      ];
    }

    if (filters?.roles?.length) {
      where.Roles = {
        some: {
          roleId: { in: filters.roles },
        },
      };
    }

    // Executar consultas em paralelo para melhor performance
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
        include: {
          Roles: {
            include: {
              Role: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.USERS.LISTED_SUCCESS,
      data: {
        users: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt,
          emailVerified: user.emailVerified,
          image: user.image,
          passwordHash: user.passwordHash,
          roles: user.Roles.map((role) => role.Role),
        })),
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getUsers" });
    return { success: false, message: MESSAGES.USERS.LIST_ERROR };
  }
}

export async function createUser(data: CreateUserSchema): ActionResponse<{
  user: User;
}> {
  try {
    if (!data.roleId) {
      return { success: false, message: MESSAGES.USERS.ROLE_REQUIRED };
    }

    if (!data.email?.trim() || !data.name?.trim() || !data.password?.trim()) {
      return { success: false, message: "Todos os campos são obrigatórios" };
    }

    const emailExists = await validateEmailUniqueness(data.email.trim());
    if (!emailExists) {
      return { success: false, message: MESSAGES.USERS.EMAIL_EXISTS };
    }

    // Verificar se existe usuário deletado com o mesmo email
    const existingDeletedUser = await prisma.user.findFirst({
      where: {
        email: data.email.trim(),
        deletedAt: { not: null },
      },
    });

    if (existingDeletedUser) {
      // Restaurar usuário deletado
      const passwordHash = await hashPassword(data.password);

      const user = await prisma.user.update({
        where: { id: existingDeletedUser.id },
        data: {
          deletedAt: null,
          name: data.name.trim(),
          email: data.email.trim(),
          status: data.status,
          passwordHash,
          updatedAt: new Date(),
        },
      });

      // Atualizar roles
      await prisma.userRole.deleteMany({
        where: { userId: user.id },
      });

      await prisma.userRole.create({
        data: { userId: user.id, roleId: data.roleId },
      });

      return {
        success: true,
        message: MESSAGES.USERS.UPDATED_SUCCESS,
        data: { user },
      };
    }

    // Criar novo usuário
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        status: data.status,
        passwordHash,
        Roles: {
          create: {
            roleId: data.roleId,
          },
        },
      },
    });

    return {
      success: true,
      message: MESSAGES.USERS.CREATED_SUCCESS,
      data: { user },
    };
  } catch (error) {
    logError({ error, where: "createUser" });
    return { success: false, message: MESSAGES.USERS.CREATED_ERROR };
  }
}

export async function updateUser(
  id: string,
  data: UpdateUserSchema,
): ActionResponse<{
  user: User;
}> {
  try {
    // Validações
    if (!id?.trim()) {
      return { success: false, message: "ID do usuário é obrigatório" };
    }

    if (!data.roleId) {
      return { success: false, message: MESSAGES.USERS.ROLE_REQUIRED };
    }

    if (!data.email?.trim() || !data.name?.trim()) {
      return { success: false, message: "Nome e email são obrigatórios" };
    }

    // Verificar se o usuário existe
    const existingUser = await validateUserExists(id);
    if (!existingUser) {
      return { success: false, message: MESSAGES.USERS.NOT_FOUND };
    }

    // Verificar se o email já existe em outro usuário
    const emailExists = await validateEmailUniqueness(data.email.trim(), id);
    if (!emailExists) {
      return { success: false, message: MESSAGES.USERS.EMAIL_EXISTS };
    }

    // Atualizar usuário e roles em uma transação
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          name: data.name.trim(),
          email: data.email.trim(),
          status: data.status,
          updatedAt: new Date(),
        },
      });

      // Atualizar roles
      await tx.userRole.deleteMany({
        where: { userId: id },
      });

      await tx.userRole.create({
        data: {
          userId: id,
          roleId: data.roleId,
        },
      });

      return user;
    });

    return {
      success: true,
      message: MESSAGES.USERS.UPDATED_SUCCESS,
      data: { user: result },
    };
  } catch (error) {
    logError({ error, where: "updateUser" });
    return { success: false, message: MESSAGES.USERS.UPDATED_ERROR };
  }
}

export async function deleteUser(id: string): ActionResponse<{
  user: User;
}> {
  try {
    // Validação
    if (!id?.trim()) {
      return { success: false, message: "ID do usuário é obrigatório" };
    }

    // Verificar se o usuário existe
    const existingUser = await validateUserExists(id);
    if (!existingUser) {
      return { success: false, message: MESSAGES.USERS.NOT_FOUND };
    }

    // Verificar se já está deletado
    if (existingUser.deletedAt) {
      return { success: false, message: "Usuário já foi excluído" };
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: MESSAGES.USERS.DELETED_SUCCESS,
      data: { user },
    };
  } catch (error) {
    logError({ error, where: "deleteUser" });
    return { success: false, message: MESSAGES.USERS.DELETED_ERROR };
  }
}
