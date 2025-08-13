import type { Role, User } from "@prisma/client";

export type RoleWithUsers = Role & { users: User[] };
