import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET() {
  try {
    // Buscar todas as permissões
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        resource: true,
        action: true,
        code: true,
      },
    });

    // Buscar a role ADMIN
    const adminRole = await prisma.role.findUnique({
      where: { slug: "ADMIN" },
    });

    let addedPermissionsCount = 0;

    if (adminRole) {
      // Para cada permissão, verificar se está associada à role ADMIN
      for (const permission of permissions) {
        const existingRolePermission = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          },
        });

        // Se não existir, adicionar a permissão à role ADMIN
        if (!existingRolePermission) {
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: permission.id,
            },
          });
          addedPermissionsCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: permissions,
      count: permissions.length,
      addedToAdmin: addedPermissionsCount,
      message: addedPermissionsCount > 0
        ? `${addedPermissionsCount} permissão(ões) adicionada(s) à role ADMIN`
        : "Todas as permissões já estão na role ADMIN",
    });
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor ao buscar permissões",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, resource, action } = body;

    // Validação dos campos obrigatórios
    if (!name || !resource || !action) {
      return NextResponse.json(
        {
          success: false,
          error: "Nome, recurso e ação são campos obrigatórios",
        },
        { status: 400 },
      );
    }

    // Gerar o código da permissão (resource:action)
    const code = `${resource}:${action}`;

    // Verificar se já existe uma permissão com o mesmo nome ou código
    const existingPermission = await prisma.permission.findFirst({
      where: {
        OR: [
          { name },
          { code },
        ],
      },
    });

    if (existingPermission) {
      return NextResponse.json(
        {
          success: false,
          error: "Já existe uma permissão com este nome ou código",
        },
        { status: 409 },
      );
    }

    // Criar a nova permissão
    const newPermission = await prisma.permission.create({
      data: {
        name,
        description: description || null,
        resource,
        action,
        code,
      },
      select: {
        id: true,
        name: true,
        description: true,
        resource: true,
        action: true,
        code: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newPermission,
        message: "Permissão criada com sucesso",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar permissão:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor ao criar permissão",
      },
      { status: 500 },
    );
  }
}
