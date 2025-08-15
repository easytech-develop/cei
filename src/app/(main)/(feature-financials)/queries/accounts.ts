"use client";

import type { AccountType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type { Meta } from "@/types/generics";
import {
  getAccountById,
  getAccountHierarchy,
  getAccounts,
} from "../server/accounts";

export const USE_GET_ACCOUNTS_KEY = ["accounts", "list"] as const;
export const USE_GET_ACCOUNT_BY_ID_KEY = ["accounts", "by-id"] as const;
export const USE_GET_ACCOUNT_HIERARCHY_KEY = ["accounts", "hierarchy"] as const;

export function useGetAccounts({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    type?: AccountType;
    parentId?: string;
  };
}) {
  return useQuery({
    queryKey: [...USE_GET_ACCOUNTS_KEY, meta, filters],
    queryFn: () => getAccounts({ meta, filters }),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useGetAccountById(id: string) {
  return useQuery({
    queryKey: [...USE_GET_ACCOUNT_BY_ID_KEY, id],
    queryFn: () => getAccountById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useGetAccountHierarchy(id?: string) {
  return useQuery({
    queryKey: [...USE_GET_ACCOUNT_HIERARCHY_KEY, id],
    queryFn: () => getAccountHierarchy({ id, includeChildren: true }),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
