import type { Permission, Role, User } from "@prisma/client";

export type PermissionWithRoles = Permission & {
  RolePermission: {
    Role: Role;
  }[];
};

export type PermissionWithUsers = Permission & {
  UserPermission: {
    User: User;
  }[];
};

export type RoleWithPermissions = Role & {
  RolePermission: {
    Permission: Permission;
  }[];
};

export type UserWithPermissions = User & {
  UserPermission: {
    Permission: Permission;
    mode: string;
    scopeJson: any;
  }[];
};
