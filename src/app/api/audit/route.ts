import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parâmetros de paginação
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Parâmetros de filtro
    const entity = searchParams.get("entity");
    const entityId = searchParams.get("entityId");
    const action = searchParams.get("action");
    const actorId = searchParams.get("actorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir filtros
    const where: any = {};

    if (entity) {
      where.entity = entity;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (action) {
      where.action = action;
    }

    if (actorId) {
      where.actorId = actorId;
    }

    if (startDate || endDate) {
      where.at = {};
      if (startDate) {
        where.at.gte = new Date(startDate);
      }
      if (endDate) {
        where.at.lte = new Date(endDate);
      }
    }

    // Buscar logs de auditoria
    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          Actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          at: "desc",
        },
        skip: offset,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Calcular informações de paginação
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      data: auditLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar logs de auditoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
