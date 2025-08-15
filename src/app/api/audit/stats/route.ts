import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parâmetros de filtro por período
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir filtros de data
    const dateFilter: { at?: { gte?: Date; lte?: Date } } = {};
    if (startDate || endDate) {
      dateFilter.at = {};
      if (startDate) {
        dateFilter.at.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.at.lte = new Date(endDate);
      }
    }

    // Buscar estatísticas
    const [
      totalLogs,
      actionsByType,
      entitiesByType,
      topActors,
      recentActivity,
    ] = await Promise.all([
      // Total de logs
      prisma.auditLog.count({ where: dateFilter }),

      // Ações por tipo
      prisma.auditLog.groupBy({
        by: ["action"],
        where: dateFilter,
        _count: {
          action: true,
        },
        orderBy: {
          _count: {
            action: "desc",
          },
        },
      }),

      // Entidades por tipo
      prisma.auditLog.groupBy({
        by: ["entity"],
        where: dateFilter,
        _count: {
          entity: true,
        },
        orderBy: {
          _count: {
            entity: "desc",
          },
        },
      }),

      // Top atores (usuários que mais fizeram ações)
      prisma.auditLog.groupBy({
        by: ["actorId"],
        where: {
          ...dateFilter,
          actorId: { not: null },
        },
        _count: {
          actorId: true,
        },
        orderBy: {
          _count: {
            actorId: "desc",
          },
        },
        take: 10,
      }),

      // Atividade recente (últimas 24 horas)
      prisma.auditLog.count({
        where: {
          ...dateFilter,
          at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24 horas
          },
        },
      }),
    ]);

    // Buscar informações dos atores para o top
    const actorIds = topActors.map((actor) => actor.actorId).filter(Boolean);
    const actors = actorIds.length > 0
      ? await prisma.user.findMany({
        where: { id: { in: actorIds as string[] } },
        select: { id: true, name: true, email: true },
      })
      : [];

    const topActorsWithInfo = topActors.map((actor) => {
      const actorInfo = actors.find((a) => a.id === actor.actorId);
      return {
        actorId: actor.actorId,
        count: actor._count.actorId,
        actor: actorInfo ? {
          id: actorInfo.id,
          name: actorInfo.name,
          email: actorInfo.email,
        } : null,
      };
    });

    return NextResponse.json({
      totalLogs,
      actionsByType: actionsByType.map((item) => ({
        action: item.action,
        count: item._count.action,
      })),
      entitiesByType: entitiesByType.map((item) => ({
        entity: item.entity,
        count: item._count.entity,
      })),
      topActors: topActorsWithInfo,
      recentActivity: {
        last24Hours: recentActivity,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas de auditoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
