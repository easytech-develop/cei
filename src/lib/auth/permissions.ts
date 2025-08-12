import { prisma } from "@/server/prisma";

type PermissionResource =
  | "user"
  | "role"
  | "permission"
  | "vendor"
  | "expense_category"
  | "account"
  | "expense"
  | "expense_item"
  | "expense_installment"
  | "expense_payment"
  | "expense_attachment"
  | "audit_log";

type PermissionAction = "read" | "create" | "update" | "delete" | "approve" | "pay";
export type PermissionCode = `${PermissionResource}:${PermissionAction}`;

export async function getEffectivePermissions(userId: string) {
  const [rolePerms, userPerms] = await Promise.all([
    prisma.rolePermission.findMany({
      where: { Role: { Users: { some: { userId } } } },
      select: { Permission: { select: { code: true } } },
    }),
    prisma.userPermission.findMany({
      where: { userId },
      select: { Permission: { select: { code: true } }, mode: true, scopeJson: true },
    }),
  ]);

  const set = new Set<string>(rolePerms.map(rp => rp.Permission.code));
  const scopes: Record<string, unknown> = {};

  for (const up of userPerms) {
    const code = up.Permission.code;
    if (up.mode === "DENY") set.delete(code);
    if (up.mode === "GRANT") set.add(code);
    if (up.scopeJson) scopes[code] = up.scopeJson;
  }

  return { codes: set as Set<PermissionCode>, scopes };
}

export function can(codes: Set<PermissionCode>, perm: PermissionCode) {
  return codes.has(perm);
}
