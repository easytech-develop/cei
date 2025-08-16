"use client";

import type { DocumentDirection, DocumentStatus } from "@prisma/client";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  MoreVertical,
  PlusIcon,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDocuments } from "../../../../queries/documents";
import type { DocumentFilters } from "../../../../types/documents";
import { CreateDocument } from "..";

const ITEMS_PER_PAGE = 10;

export default function ListDocuments() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DocumentFilters>({});

  const meta = {
    page,
    limit: ITEMS_PER_PAGE,
  };

  const { data, isLoading, error } = useDocuments(meta, filters);

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    setPage(1);
  };

  const handleDirectionFilter = (direction: DocumentDirection | "all") => {
    setFilters((prev) => ({
      ...prev,
      direction: direction === "all" ? undefined : [direction],
    }));
    setPage(1);
  };

  const handleStatusFilter = (status: DocumentStatus | "all") => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : [status],
    }));
    setPage(1);
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(amount));
  };

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "PARTIALLY_PAID":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "PAID":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "CANCELLED":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">
            Erro ao carregar documentos: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Movimentações</CardTitle>
          <CreateDocument
            trigger={
              <Button size="icon">
                <PlusIcon className="h-4 w-4" />
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Input
              placeholder="Buscar por número, descrição, contato..."
              onChange={(e) => handleSearch(e.target.value)}
              className="md:col-span-2"
            />
            <Select onValueChange={handleDirectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Direção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="IN">A Receber</SelectItem>
                <SelectItem value="OUT">A Pagar</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="OPEN">Aberto</SelectItem>
                <SelectItem value="PARTIALLY_PAID">
                  Parcialmente Pago
                </SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de documentos */}
          <div className="space-y-4">
            {isLoading ? (
              // Skeletons de carregamento
              [1, 2, 3].map((i) => (
                <Card key={`skeleton-${i}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : data?.data?.documents?.length ? (
              data.data.documents.map((document) => (
                <Card
                  key={document.id}
                  className="group hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Ícone e Informações */}
                      <div className="flex items-center gap-3 flex-1">
                        {/* Ícone circular com cor baseada na direção */}
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            document.direction === "IN"
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-red-100 dark:bg-red-900/30",
                          )}
                        >
                          {
                            document.direction === "IN" ? (
                              <BanknoteArrowUp
                                className={cn(
                                  "h-5 w-5",
                                  "text-green-600 dark:text-green-400"
                                )}
                              />
                            ) : (
                              <BanknoteArrowDown
                                className={cn(
                                  "h-5 w-5",
                                  "text-red-600 dark:text-red-400"
                                )}
                              />
                            )
                          }
                        </div>

                        {/* Valor e Descrição */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-lg font-semibold",
                                document.direction === "IN"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400",
                              )}
                            >
                              {document.direction === "IN" ? "+" : "-"}
                              {formatCurrency(document.totalAmount)}
                            </span>
                            {document.status !== "PAID" && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  getStatusColor(document.status),
                                )}
                              >
                                {document.status === "OPEN" && "Aberto"}
                                {document.status === "PARTIALLY_PAID" &&
                                  "Parcial"}
                                {document.status === "CANCELLED" && "Cancelado"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {document.description || document.contact.name}
                          </p>
                        </div>
                      </div>

                      {/* Menu de ações */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Nenhum documento encontrado
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Paginação */}
          {data?.data?.meta?.totalPages && data.data.meta.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {page} de {data.data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.data.meta.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
