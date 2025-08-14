"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Calendar,
  Check,
  DollarSign,
  Edit,
  Loader2,
  Tag,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Meta } from "@/types/generics";
import { useGetCategories } from "../../../queries/categories";
import { useExpenses } from "../../../queries/expenses";
import { useGetVendors } from "../../../queries/vendors";
import type { ExpenseWithRelations } from "../../../types/expenses";
import DeleteExpense from "./delete-expense";
import UpdateExpense from "./update-expense";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    DRAFT: { label: "Rascunho", variant: "secondary" as const },
    OPEN: { label: "Aberta", variant: "default" as const },
    PARTIALLY_PAID: { label: "Parcialmente Paga", variant: "outline" as const },
    PAID: { label: "Paga", variant: "default" as const },
    CANCELLED: { label: "Cancelada", variant: "destructive" as const },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
};

const columns: ColumnDef<ExpenseWithRelations>[] = [
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[300px] truncate cursor-help">
                {row.original.description}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs break-words">
                {row.original.description}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "vendor",
    header: "Fornecedor",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span
            className="max-w-[200px] truncate"
            title={row.original.Vendor.name}
          >
            {row.original.Vendor.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span
            className="max-w-[200px] truncate"
            title={row.original.Category.name}
          >
            {row.original.Category.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "competenceDate",
    header: "Competência",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.original.competenceDate)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalNet",
    header: "Valor Total",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {formatCurrency(Number(row.original.totalNet))}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return getStatusBadge(row.original.status);
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <UpdateExpense
            trigger={
              <Button size="icon" variant="ghost">
                <Edit />
              </Button>
            }
            expense={row.original}
          />
          <DeleteExpense
            trigger={
              <Button size="icon" variant="ghost">
                <Trash2 />
              </Button>
            }
            expense={row.original}
          />
        </div>
      );
    },
  },
];

export default function ListExpenses() {
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10 });
  const [filters, setFilters] = useState<{
    search?: string;
    status?: "DRAFT" | "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
    vendorId?: string;
    categoryId?: string;
  }>({});

  const { data, isLoading, refetch } = useExpenses(filters, meta);

  const { data: vendorsData } = useGetVendors({
    meta: { page: 1, limit: 1000 },
  });

  const { data: categoriesData } = useGetCategories({
    meta: { page: 1, limit: 1000 },
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: "DRAFT" | "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED") => {
    setFilters((prev) => ({ ...prev, status }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const clearStatusFilter = () => {
    setFilters((prev) => ({ ...prev, status: undefined }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleVendorFilter = (vendorId: string) => {
    setFilters((prev) => ({ ...prev, vendorId }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, categoryId }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const expenses = data?.data?.expenses || [];
  const vendors = vendorsData?.vendors || [];
  const categories = categoriesData?.categories || [];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar por descrição..."
            value={filters.search || ""}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Filtro de Status */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start">
              {filters.status ? (
                getStatusBadge(filters.status)
              ) : (
                <>
                  <Loader2 className="mr-2 h-4 w-4" />
                  Status
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar status..." />
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleStatusFilter("DRAFT")}
                    className="flex items-center gap-2"
                  >
                    Rascunho
                    <Check
                      className={cn(
                        "h-4 w-4",
                        filters.status === "DRAFT"
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleStatusFilter("OPEN")}
                    className="flex items-center gap-2"
                  >
                    Aberta
                    <Check
                      className={cn(
                        "h-4 w-4",
                        filters.status === "OPEN" ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleStatusFilter("PARTIALLY_PAID")}
                    className="flex items-center gap-2"
                  >
                    Parcialmente Paga
                    <Check
                      className={cn(
                        "h-4 w-4",
                        filters.status === "PARTIALLY_PAID"
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleStatusFilter("PAID")}
                    className="flex items-center gap-2"
                  >
                    Paga
                    <Check
                      className={cn(
                        "h-4 w-4",
                        filters.status === "PAID" ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleStatusFilter("CANCELLED")}
                    className="flex items-center gap-2"
                  >
                    Cancelada
                    <Check
                      className={cn(
                        "h-4 w-4",
                        filters.status === "CANCELLED"
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={clearStatusFilter}>
                    Limpar filtro
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Filtro de Fornecedor */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start">
              {filters.vendorId ? (
                vendors.find((v) => v.id === filters.vendorId)?.name ||
                "Fornecedor"
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Fornecedor
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar fornecedor..." />
              <CommandList>
                <CommandGroup>
                  {vendors.map((vendor) => (
                    <CommandItem
                      key={vendor.id}
                      onSelect={() => handleVendorFilter(vendor.id)}
                      className="flex items-center gap-2"
                    >
                      {vendor.name}
                      <Check
                        className={cn(
                          "h-4 w-4",
                          filters.vendorId === vendor.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => handleVendorFilter("")}>
                    Limpar filtro
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Filtro de Categoria */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start">
              {filters.categoryId ? (
                categories.find((c) => c.id === filters.categoryId)?.name ||
                "Categoria"
              ) : (
                <>
                  <Tag className="mr-2 h-4 w-4" />
                  Categoria
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar categoria..." />
              <CommandList>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => handleCategoryFilter(category.id)}
                      className="flex items-center gap-2"
                    >
                      {category.name}
                      <Check
                        className={cn(
                          "h-4 w-4",
                          filters.categoryId === category.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => handleCategoryFilter("")}>
                    Limpar filtro
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Botão Limpar Filtros */}
        {(filters.search ||
          filters.status ||
          filters.vendorId ||
          filters.categoryId) && (
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          )}
      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={expenses}
        loading={isLoading}
        meta={data?.data?.meta}
        setMeta={setMeta}
      />
    </div>
  );
}
