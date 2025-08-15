import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Permissões diretas do usuário
        UserPermissions: {
          select: {
            mode: true,
            scopeJson: true,
            Permission: {
              select: {
                id: true,
                resource: true,
                action: true,
                code: true,
              },
            },
          },
        },
        // Roles do usuário
        Roles: {
          select: {
            Role: {
              select: {
                id: true,
                slug: true,
                name: true,
                // Permissões do role
                RolePermissions: {
                  select: {
                    Permission: {
                      select: {
                        id: true,
                        resource: true,
                        action: true,
                        code: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Processar e organizar as permissões
    const usersWithPermissions = users.map((user) => {
      // Permissões diretas
      const directPermissions = user.UserPermissions.map((up) => ({
        ...up.Permission,
        mode: up.mode,
        scope: up.scopeJson,
        source: "direct",
      }));

      // Permissões através dos roles
      const rolePermissions = user.Roles.flatMap((userRole) =>
        userRole.Role.RolePermissions.map((rp) => ({
          ...rp.Permission,
          mode: "GRANT", // Permissões de role são sempre GRANT
          scope: null,
          source: "role",
          roleId: userRole.Role.id,
          roleSlug: userRole.Role.slug,
          roleName: userRole.Role.name,
        }))
      );

      // Combinar todas as permissões
      const allPermissions = [...directPermissions, ...rolePermissions];

      // Remover duplicatas (priorizar permissões diretas)
      const uniquePermissions = allPermissions.reduce((acc, permission) => {
        const existing = acc.find((p) => p.code === permission.code);
        if (!existing || permission.source === "direct") {
          // Se não existe ou é permissão direta, adiciona/substitui
          return acc.filter((p) => p.code !== permission.code).concat(permission);
        }
        return acc;
      }, [] as typeof allPermissions);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions: uniquePermissions,
        roles: user.Roles.map((ur) => ({
          id: ur.Role.id,
          slug: ur.Role.slug,
          name: ur.Role.name,
        })),
      };
    });

    return NextResponse.json(usersWithPermissions);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, status = "ACTIVE" } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        status: status as "ACTIVE" | "SUSPENDED",
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: newUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
