import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
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
        Users: {
          select: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Processar e organizar os dados
    const rolesWithPermissions = roles.map((role) => ({
      id: role.id,
      slug: role.slug,
      name: role.name,
      permissions: role.RolePermissions.map((rp) => ({
        id: rp.Permission.id,
        resource: rp.Permission.resource,
        action: rp.Permission.action,
        code: rp.Permission.code,
      })),
      users: role.Users.map((ur) => ({
        id: ur.User.id,
        name: ur.User.name,
        email: ur.User.email,
        status: ur.User.status,
      })),
      userCount: role.Users.length,
    }));

    return NextResponse.json(rolesWithPermissions);
  } catch (error) {
    console.error("Erro ao buscar roles:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, name } = body;

    if (!slug || !name) {
      return NextResponse.json(
        { error: "Slug e nome são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar se já existe uma role com o mesmo slug
    const existingRole = await prisma.role.findUnique({
      where: { slug },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Já existe uma role com este slug" },
        { status: 400 },
      );
    }

    const newRole = await prisma.role.create({
      data: {
        slug,
        name,
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    return NextResponse.json(
      {
        message: "Role criada com sucesso",
        role: newRole,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar role:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
