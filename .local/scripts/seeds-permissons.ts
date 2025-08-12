/* seeds-permissons.ts
 * Execute com:  npx tsx seeds-permissons.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** 1) Permissões iniciais (resource:action) */
const PERMISSION_CODES: Array<{ code: string; resource: string; action: string }> = [
  // despesas
  { code: "expense:read", resource: "expense", action: "read" },
  { code: "expense:create", resource: "expense", action: "create" },
  { code: "expense:update", resource: "expense", action: "update" },
  { code: "expense:delete", resource: "expense", action: "delete" },
  { code: "expense:approve", resource: "expense", action: "approve" },
  { code: "expense:pay", resource: "expense", action: "pay" },
  // fornecedores
  { code: "vendor:read", resource: "vendor", action: "read" },
  { code: "vendor:create", resource: "vendor", action: "create" },
  { code: "vendor:update", resource: "vendor", action: "update" },
  // categorias (plano de contas)
  { code: "category:read", resource: "category", action: "read" },
  { code: "category:create", resource: "category", action: "create" },
  { code: "category:update", resource: "category", action: "update" },
  // contas
  { code: "account:read", resource: "account", action: "read" },
  // alunos
  { code: "student:read", resource: "student", action: "read" },
  { code: "student:create", resource: "student", action: "create" },
  { code: "student:update", resource: "student", action: "update" },
  // turmas
  { code: "classroom:read", resource: "classroom", action: "read" },
  { code: "classroom:create", resource: "classroom", action: "create" },
  { code: "classroom:update", resource: "classroom", action: "update" },
];

/** 2) Roles e seus conjuntos de permissões */
const ROLE_DEFS: Array<{ slug: string; name: string; permissions: string[] }> = [
  { slug: "OWNER", name: "Proprietário", permissions: ["*"] },
  {
    slug: "DIRECTOR",
    name: "Diretor(a)",
    permissions: [
      "expense:read", "expense:create", "expense:update", "expense:approve", "expense:pay",
      "vendor:read", "vendor:create", "vendor:update",
      "category:read", "category:create", "category:update",
      "account:read",
      "student:read",
      "classroom:read", "classroom:create", "classroom:update",
    ],
  },
  {
    slug: "SECRETARY",
    name: "Secretaria",
    permissions: [
      "expense:read", "expense:create", "expense:update", "expense:pay",
      "vendor:read", "vendor:create", "vendor:update",
      "student:read", "student:create", "student:update",
      "classroom:read",
    ],
  },
  {
    slug: "TEACHER",
    name: "Professor(a)",
    permissions: ["student:read", "classroom:read"],
  },
];

/** 3) Admin inicial (defina via env) */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@creche.local";
const ADMIN_NAME = process.env.ADMIN_NAME || "Administrador";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // troque em produção!

async function main() {
  console.log("== Seeding: permissions ==");
  for (const perm of PERMISSION_CODES) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }
  const allPerms = await prisma.permission.findMany({ select: { id: true, code: true } });
  const byCode = new Map(allPerms.map(p => [p.code, p.id]));

  console.log("== Seeding: roles ==");
  for (const def of ROLE_DEFS) {
    await prisma.$transaction(async (tx) => {
      const role = await tx.role.upsert({
        where: { slug: def.slug },
        update: { name: def.name },
        create: { slug: def.slug, name: def.name },
      });

      let targetPermIds: string[] = [];
      if (def.permissions.includes("*")) {
        targetPermIds = allPerms.map(p => p.id);
      } else {
        const missing: string[] = [];
        for (const code of def.permissions) {
          const id = byCode.get(code);
          if (!id) missing.push(code);
          else targetPermIds.push(id);
        }
        if (missing.length) console.warn(`[WARN][${def.slug}] Permissões não encontradas:`, missing);
      }

      const current = await tx.rolePermission.findMany({
        where: { roleId: role.id },
        select: { permissionId: true },
      });
      const currentSet = new Set(current.map(rp => rp.permissionId));
      const targetSet = new Set(targetPermIds);

      const toAdd = [...targetSet].filter(id => !currentSet.has(id));
      const toRemove = [...currentSet].filter(id => !targetSet.has(id));

      if (toAdd.length) {
        await tx.rolePermission.createMany({
          data: toAdd.map(permissionId => ({ roleId: role.id, permissionId })),
          skipDuplicates: true,
        });
      }
      if (toRemove.length) {
        await tx.rolePermission.deleteMany({
          where: { roleId: role.id, permissionId: { in: toRemove } },
        });
      }

      console.log(`Role ${def.slug} -> add: ${toAdd.length}, remove: ${toRemove.length}`);
    });
  }

  console.log("== Seeding: admin user ==");
  // cria/atualiza usuário admin
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, passwordHash },
    create: { email: ADMIN_EMAIL, name: ADMIN_NAME, passwordHash, status: "ACTIVE" as any },
  });

  // garante vínculo com OWNER
  const ownerRole = await prisma.role.findUnique({ where: { slug: "OWNER" } });
  if (!ownerRole) throw new Error("Role OWNER não encontrada (seed falhou antes).");

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: ownerRole.id } },
    update: {},
    create: { userId: admin.id, roleId: ownerRole.id },
  });

  console.log(`Admin pronto: ${ADMIN_EMAIL} (role OWNER) ✅`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
