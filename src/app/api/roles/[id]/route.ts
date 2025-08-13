import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
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
    const duplicateRole = await prisma.role.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (duplicateRole) {
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
        updatedAt: new Date(),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        updatedAt: true,
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {

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

    // Verificar se há usuários associados a esta role
    const usersWithRole = await prisma.userRole.count({
      where: { roleId: id },
    });

    if (usersWithRole > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir a role. Existem ${usersWithRole} usuário(s) associado(s) a esta role.`,
        },
        { status: 400 },
      );
    }

    // Excluir a role
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
