import type { Role, User } from "@prisma/client";

export type UserWithRoles = User & { roles: Role[] };
