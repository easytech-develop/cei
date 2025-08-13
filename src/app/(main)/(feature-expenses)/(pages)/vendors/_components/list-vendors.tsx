"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Check,
  Edit,
  FileText,
  Loader2,
  Mail,
  Phone,
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
import { cn } from "@/lib/utils";
import type { Meta } from "@/types/generics";
import { useGetVendors } from "../../../queries/vendors";
import type { VendorWithExpenses } from "../../../types/vendors";
import DeleteVendor from "./delete-vendor";
import UpdateVendor from "./update-vendor";

const columns: ColumnDef<VendorWithExpenses>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[200px] truncate" title={row.original.name}>
            {row.original.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "document",
    header: "Documento",
    cell: ({ row }) => {
      return row.original.document ? (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.document}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return row.original.email ? (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[200px] truncate" title={row.original.email}>
            {row.original.email}
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      return row.original.phone ? (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.phone}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => {
      return row.original.active ? (
        <Badge variant="default">Ativo</Badge>
      ) : (
        <Badge variant="secondary">Inativo</Badge>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <UpdateVendor
            trigger={
              <Button size="icon" variant="ghost">
                <Edit />
              </Button>
            }
            vendor={row.original}
          />
          <DeleteVendor
            trigger={
              <Button size="icon" variant="ghost">
                <Trash2 />
              </Button>
            }
            vendor={row.original}
          />
        </div>
      );
    },
  },
];

export default function ListVendors() {
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10 });
  const [filters, setFilters] = useState<{
    search?: string;
    active?: boolean;
  }>({});

  const { data, isLoading, refetch } = useGetVendors({
    meta,
    filters,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (active: boolean | undefined) => {
    setFilters((prev) => ({ ...prev, active }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({});
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const vendors = data?.vendors || [];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar por nome, documento ou email..."
            value={filters.search || ""}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Filtro de Status */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start">
              {filters.active === true ? (
                <Badge variant="default">Ativo</Badge>
              ) : filters.active === false ? (
                <Badge variant="secondary">Inativo</Badge>
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
                    onSelect={() => handleStatusFilter(true)}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        filters.active === true ? "opacity-100" : "opacity-0",
                      )}
                    />
                    Ativo
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleStatusFilter(false)}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        filters.active === false ? "opacity-100" : "opacity-0",
                      )}
                    />
                    Inativo
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => handleStatusFilter(undefined)}>
                    Limpar filtro
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Botão Limpar Filtros */}
        {(filters.search || filters.active !== undefined) && (
          <Button variant="outline" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={vendors}
        loading={isLoading}
        meta={data?.meta}
        setMeta={setMeta}
      />
    </div>
  );
}
