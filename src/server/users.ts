"use server";

import type { Prisma, Role, User } from "@prisma/client";
import { logError } from "@/lib/utils";
import type { ActionResponse, Meta } from "@/types/generics";
import { prisma } from "./prisma";

export type UserWithRoles = User & { roles: Role[] };

export async function getUsers({
  meta,
  search,
}: {
  meta: Meta;
  search?: string;
}): ActionResponse<{
  users: UserWithRoles[];
  meta: Meta;
}> {
  try {
    const { page, limit } = meta;
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Roles: {
          include: {
            Role: true,
          },
        },
      },
    });

    const total = await prisma.user.count({ where });
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Usuários listados com sucesso",
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
    return { success: false, message: "Erro ao listar usuários" };
  }
}
