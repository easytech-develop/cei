import type { CashAccountType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type { Meta } from "@/types/generics";
import { getCashAccountById, getCashAccounts } from "../server/cash-accounts";

export const USE_GET_CASH_ACCOUNTS_KEY = ["cash-accounts", "list"] as const;
export const USE_GET_CASH_ACCOUNT_BY_ID_KEY = [
  "cash-accounts",
  "by-id",
] as const;

export function useGetCashAccounts({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    type?: CashAccountType;
    isActive?: boolean;
  };
}) {
  return useQuery({
    queryKey: [...USE_GET_CASH_ACCOUNTS_KEY, meta, filters],
    queryFn: () => getCashAccounts({ meta, filters }),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useGetCashAccountById(id: string) {
  return useQuery({
    queryKey: [...USE_GET_CASH_ACCOUNT_BY_ID_KEY, id],
    queryFn: () => getCashAccountById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
