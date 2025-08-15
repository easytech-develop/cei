import type { Account, AccountType } from "@prisma/client"

// Tipo para conta com informações básicas
export type AccountWithBasicInfo = Account

// Tipo para conta com conta pai relacionada
export type AccountWithParent = Account & {
  parent: {
    id: string;
    name: string;
    code: string | null;
    type: AccountType;
  } | null;
}

// Tipo para conta com hierarquia completa
export type AccountWithHierarchy = Account & {
  parent: AccountWithParent | null;
  children: AccountWithParent[];

}

// Tipo para resposta de conta
export type AccountResponse = {
  id: string;
  name: string;
  code: string | null;
  type: AccountType;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

// Tipo para listagem de contas
export type AccountListResponse = {
  accounts: AccountWithParent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
