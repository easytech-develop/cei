import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: id },
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
    });

    const permissions = rolePermissions.map((rp) => rp.Permission);

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Erro ao buscar permissões da role:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { permissionIds } = body;

    if (!permissionIds || !Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: "Lista de IDs de permissões é obrigatória" },
        { status: 400 },
      );
    }

    // Verificar se a role existe
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role não encontrada" },
        { status: 404 },
      );
    }

    // Verificar se as permissões existem
    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
      },
    });

    if (permissions.length !== permissionIds.length) {
      return NextResponse.json(
        { error: "Uma ou mais permissões não foram encontradas" },
        { status: 400 },
      );
    }

    // Criar as associações de permissões com a role
    const rolePermissions = await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId: string) => ({
        roleId: id,
        permissionId,
      })),
      skipDuplicates: true, // Ignora se já existir
    });

    return NextResponse.json({
      message: "Permissões adicionadas à role com sucesso",
      addedCount: rolePermissions.count,
    });
  } catch (error) {
    console.error("Erro ao adicionar permissões à role:", error);
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
    const { searchParams } = new URL(request.url);
    const permissionId = searchParams.get("permissionId");

    if (!permissionId) {
      return NextResponse.json(
        { error: "ID da permissão é obrigatório" },
        { status: 400 },
      );
    }

    // Verificar se a role existe
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role não encontrada" },
        { status: 404 },
      );
    }

    // Remover a permissão da role
    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId: id,
          permissionId,
        },
      },
    });

    return NextResponse.json({
      message: "Permissão removida da role com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover permissão da role:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
