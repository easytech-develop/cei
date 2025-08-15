import { useQuery } from "@tanstack/react-query";
import type { Meta } from "@/types/generics";
import { getDocumentById, getDocuments } from "../server/documents";
import type { DocumentFilters } from "../types/documents";

export const documentsKeys = {
  all: ["documents"] as const,
  lists: () => [...documentsKeys.all, "list"] as const,
  list: (meta: Meta, filters?: DocumentFilters) =>
    [...documentsKeys.lists(), meta, filters] as const,
  details: () => [...documentsKeys.all, "detail"] as const,
  detail: (id: string) => [...documentsKeys.details(), id] as const,
};

export function useDocuments(meta: Meta, filters?: DocumentFilters) {
  return useQuery({
    queryKey: documentsKeys.list(meta, filters),
    queryFn: () => getDocuments({ meta, filters }),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: () => getDocumentById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
}
