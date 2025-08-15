"use client";

import type { ContactRole } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import type { Meta, UseQueryOptions } from "@/types/generics";
import { getContactById, getContacts } from "../server/contacts";

// Query Keys
export const USE_GET_CONTACTS_KEY = ["useGetContacts"];
export const USE_GET_CONTACT_BY_ID_KEY = ["useGetContactById"];

// Query para listar contatos com paginação e filtros
export function useGetContacts(params?: {
  meta?: Meta;
  filters?: {
    search?: string;
    roles?: ContactRole[];
  };
  options?: UseQueryOptions;
}) {
  const { meta, filters, options } = params ?? {};
  const metaQuery = meta ?? {
    page: 1,
    limit: 10,
  };

  return useQuery({
    queryKey: [...USE_GET_CONTACTS_KEY, metaQuery, filters],
    queryFn: async () => {
      const response = await getContacts({ meta: metaQuery, filters });
      return (
        response.data ?? {
          contacts: [],
          meta: {
            page: 1,
            limit: 10,
          },
        }
      );
    },
    ...options,
  });
}

// Query para buscar contato por ID
export function useGetContactById(params: {
  id: string;
  options?: UseQueryOptions;
}) {
  const { id, options } = params;

  return useQuery({
    queryKey: [...USE_GET_CONTACT_BY_ID_KEY, id],
    queryFn: async () => {
      const response = await getContactById(id);
      return response.data?.contact ?? null;
    },
    enabled: !!id,
    ...options,
  });
}

// Query para buscar contatos clientes usando filtro
export function useGetCustomers(params?: {
  meta?: Meta;
  options?: UseQueryOptions;
}) {
  return useGetContacts({
    meta: params?.meta,
    filters: {
      roles: ["CUSTOMER" as ContactRole],
    },
    options: params?.options,
  });
}

// Query para buscar contatos fornecedores usando filtro
export function useGetSuppliers(params?: {
  meta?: Meta;
  options?: UseQueryOptions;
}) {
  return useGetContacts({
    meta: params?.meta,
    filters: {
      roles: ["SUPPLIER" as ContactRole],
    },
    options: params?.options,
  });
}
