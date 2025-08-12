// src/server/audit/middleware.ts
import type { Prisma, PrismaClient } from "@prisma/client";
import { getActorContext } from "./context";

const AUDITED_MODELS = new Set<string>([
  "User",
  "Vendor",
  "Expense",
  "ExpenseItem",
  "ExpenseInstallment",
  "ExpensePayment",
  "ExpenseCategory",
  "Account",
]);

const HIDDEN_FIELDS = new Set<string>(["passwordHash"]);

const IGNORED_ACTIONS = new Set<string>([
  "findMany",
  "findUnique",
  "findFirst",
  "findFirstOrThrow",
  "findUniqueOrThrow",
  "aggregate",
  "count",
  "groupBy",
]);

function mapAction(model: string, op: Prisma.PrismaAction, before?: any, after?: any): string {
  if (op === "create") return "CREATED";
  if (op === "delete") return "DELETED";
  if (op === "update") {
    if (before && after && before.deletedAt == null && after.deletedAt != null) return "SOFT_DELETED";
    return "UPDATED";
  }
  if (op === "upsert") return before ? "UPDATED" : "CREATED";
  if (op === "createMany") return "BULK_CREATED";
  if (op === "updateMany") return "BULK_UPDATED";
  if (op === "deleteMany") return "BULK_DELETED";
  return op.toUpperCase();
}

function sanitize(obj: any) {
  if (!obj || typeof obj !== "object") return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const k of Object.keys(obj)) {
    if (HIDDEN_FIELDS.has(k)) out[k] = "[REDACTED]";
    else if (obj[k] && typeof obj[k] === "object") out[k] = sanitize(obj[k]);
    else out[k] = obj[k];
  }
  return out;
}

function makeDiff(before?: any, after?: any) {
  if (!before && after) return { after: sanitize(after) };
  if (before && !after) return { before: sanitize(before) };

  const b = sanitize(before ?? {});
  const a = sanitize(after ?? {});
  const changed: Record<string, { before: any; after: any }> = {};
  const keys = new Set([...Object.keys(b), ...Object.keys(a)]);
  for (const k of keys) {
    const bv = b[k];
    const av = a[k];
    const bothObjects = typeof bv === "object" && typeof av === "object";
    const equal = bothObjects ? JSON.stringify(bv) === JSON.stringify(av) : bv === av;
    if (!equal) changed[k] = { before: bv, after: av };
  }
  return Object.keys(changed).length ? changed : undefined;
}

function getId(obj: any): string | undefined {
  if (!obj) return undefined;
  if (obj.id != null) return String(obj.id);
  return undefined;
}

export function auditMiddleware(prisma: PrismaClient): Prisma.Middleware {
  return async (params, next) => {
    const { model, action } = params;
    if (!model || model === "AuditLog" || !AUDITED_MODELS.has(model) || IGNORED_ACTIONS.has(action)) {
      return next(params);
    }

    const ctx = getActorContext();
    const op = action as Prisma.PrismaAction;

    let before: any | undefined;
    if (op === "update" || op === "delete" || op === "upsert") {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: acesso dinâmico ao model
        before = await (prisma as any)[model].findUnique?.({ where: params.args?.where }) ?? undefined;
      } catch { }
    } else if (op === "updateMany" || op === "deleteMany") {
      before = { where: params.args?.where };
    }

    const result = await next(params);

    let after: any | undefined;
    if (op === "create" || op === "update" || op === "upsert") after = result;
    else if (op === "createMany") after = { count: result?.count };
    else if (op === "updateMany" || op === "deleteMany") after = { count: result?.count };

    const actionName = mapAction(model, op, before, after);
    const entityId = getId(after) ?? getId(before) ?? "(unknown)";
    const diff = makeDiff(before, after);

    if (op === "update" && !diff) return result;

    try {
      // isso passa pelo middleware mas é ignorado pq model === "AuditLog"
      await (prisma as any).auditLog.create({
        data: {
          entity: model,
          entityId,
          action: actionName,
          actorId: ctx.userId ?? null,
          ip: ctx.ip ?? null,
          userAgent: ctx.userAgent ?? null,
          diff: diff ?? null,
        },
      });
    } catch (e) {
      console.error("[audit] failed to write log:", e);
    }

    return result;
  };
}
