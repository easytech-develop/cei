import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const auditLog = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        Actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!auditLog) {
      return NextResponse.json(
        { error: "Log de auditoria não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(auditLog);
  } catch (error) {
    console.error("Erro ao buscar log de auditoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
