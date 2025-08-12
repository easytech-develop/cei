import { NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
      select: {
        id: true,
        resource: true,
        action: true,
        code: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: permissions,
      count: permissions.length,
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
