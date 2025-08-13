import "server-only";

import { PrismaClient } from "@prisma/client";
import { auditMiddleware } from "@/server/audit/middleware";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

// prisma.$use(auditMiddleware(prisma));

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
