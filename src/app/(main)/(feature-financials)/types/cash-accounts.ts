import type { CashAccount, CashAccountType } from "@prisma/client"

// Tipo para conta bancária com informações básicas
export type CashAccountWithBasicInfo = CashAccount

// Tipo para conta bancária com conta contábil relacionada
export type CashAccountWithAccount = CashAccount & {
  account: {
    id: string;
    name: string
    code: string | null;
    type: string
  } | null
}

// Tipo para conta bancária com estatísticas
export type CashAccountWithStats = CashAccount & {
  _count: {
    transactions: number
  }
  _sum: {
    transactions: {
      amount: number | null;
    };
  };
}

// Tipo para resposta de conta bancária
export type CashAccountResponse = {
  id: string;
  name: string;
  type: CashAccountType;
  agency: string | null;
  accountNumber: string | null;
  pixKey: string | null;
  accountId: string | null;
  openingBalance: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
