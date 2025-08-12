import { AsyncLocalStorage } from "node:async_hooks";

type AuditContext = {
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export const auditContext = new AsyncLocalStorage<AuditContext>();

export function runAsActor<T>(
  ctx: AuditContext,
  fn: () => Promise<T> | T
): Promise<T> | T {
  return auditContext.run(ctx, fn);
}

export function getActorContext(): AuditContext {
  return auditContext.getStore() ?? {};
}
