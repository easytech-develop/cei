import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const role = await prisma.role.findUnique({
      where: { id },
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
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role não encontrada" },
        { status: 404 },
      );
    }

    const roleWithPermissions = {
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
    };

    return NextResponse.json(roleWithPermissions);
  } catch (error) {
    console.error("Erro ao buscar role:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { slug, name } = body;

    if (!slug || !name) {
      return NextResponse.json(
        { error: "Slug e nome são obrigatórios" },
        { status: 400 },
      );
    }

    // Verificar se a role existe
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role não encontrada" },
        { status: 404 },
      );
    }

    // Verificar se já existe outra role com o mesmo slug
    const roleWithSameSlug = await prisma.role.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (roleWithSameSlug) {
      return NextResponse.json(
        { error: "Já existe uma role com este slug" },
        { status: 400 },
      );
    }

    const updatedRole = await prisma.role.update({
      where: { id },
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

    return NextResponse.json({
      message: "Role atualizada com sucesso",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Erro ao atualizar role:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    // Verificar se a role existe
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        Users: true,
      },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role não encontrada" },
        { status: 404 },
      );
    }

    // Verificar se há usuários associados à role
    if (existingRole.Users.length > 0) {
      return NextResponse.json(
        {
          error:
            "Não é possível excluir uma role que possui usuários associados",
          userCount: existingRole.Users.length,
        },
        { status: 400 },
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Role excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir role:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
