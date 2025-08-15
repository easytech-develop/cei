"use client";

import type { CashAccountType } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, CircleFadingPlus, Edit, Trash2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import type { Meta } from "@/types/generics";
import { useGetCashAccounts } from "../../../queries/cash-accounts";
import type { CashAccountResponse } from "../../../types/cash-accounts";
import DeleteCashAccount from "./delete-cash-account";
import UpdateCashAccount from "./update-cash-account";

const columns: ColumnDef<CashAccountResponse>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.original.type;
      const typeLabels: Record<CashAccountType, string> = {
        CASH: "Dinheiro",
        CHECKING: "Conta Corrente",
        SAVINGS: "Conta Poupança",
        INVESTMENT: "Investimento",
        OTHER: "Outro",
      };
      return (
        <Badge variant="outline">
          {typeLabels[type]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "agency",
    header: "Agência",
    cell: ({ row }) => {
      const agency = row.original.agency;
      return agency || "-";
    },
  },
  {
    accessorKey: "accountNumber",
    header: "Conta",
    cell: ({ row }) => {
      const accountNumber = row.original.accountNumber;
      return accountNumber || "-";
    },
  },
  {
    accessorKey: "openingBalance",
    header: "Saldo Inicial",
    cell: ({ row }) => {
      const balance = row.original.openingBalance;
      return formatCurrency(balance);
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <UpdateCashAccount
            trigger={
              <Button size="icon" variant="ghost">
                <Edit />
              </Button>
            }
            cashAccount={row.original}
          />
          <DeleteCashAccount
            trigger={
              <Button size="icon" variant="ghost">
                <Trash2 />
              </Button>
            }
            cashAccount={row.original}
          />
        </div>
      );
    },
  },
];

const typeOptions = [
  { value: "CASH", label: "Dinheiro" },
  { value: "CHECKING", label: "Conta Corrente" },
  { value: "SAVINGS", label: "Conta Poupança" },
  { value: "INVESTMENT", label: "Investimento" },
  { value: "OTHER", label: "Outro" },
];

export default function ListCashAccounts() {
  const [filters, setFilters] = useState({
    search: "",
    type: undefined as CashAccountType | undefined,
    isActive: undefined as boolean | undefined,
  });
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetCashAccounts({ meta, filters });

  function handleChangeType(type?: string) {
    if (!type) {
      setFilters({ ...filters, type: undefined });
    } else {
      setFilters({
        ...filters,
        type: type as CashAccountType,
      });
    }
  }

  function handleChangeStatus(status?: string) {
    if (!status) {
      setFilters({ ...filters, isActive: undefined });
    } else {
      setFilters({
        ...filters,
        isActive: status === "true",
      });
    }
  }

  useEffect(() => {
    if (window) {
      const storageMeta = localStorage.getItem("list-cash-accounts-meta");
      const storageFilters = localStorage.getItem("list-cash-accounts-filters");

      if (storageMeta) {
        setMeta(JSON.parse(storageMeta));
      }

      if (storageFilters) {
        setFilters(JSON.parse(storageFilters));
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <Input
          placeholder="Pesquisar"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full lg:max-w-xs"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="border-dashed">
              <CircleFadingPlus className="h-4 w-4 shrink-0" />
              Tipo
              {filters.type && (
                <Separator orientation="vertical" className="h-4 mx-1" />
              )}
              {filters.type && (
                <div className="inline-flex items-center border py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal">
                  {typeOptions.find(t => t.value === filters.type)?.label}
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar tipo..." />
              <CommandList>
                <CommandGroup>
                  {typeOptions.map((type) => (
                    <CommandItem
                      key={type.value}
                      onSelect={() => {
                        handleChangeType(type.value);
                      }}
                    >
                      {type.label}
                      <Check
                        className={cn(
                          "h-4 w-4",
                          filters.type === type.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  className="flex justify-center"
                  onSelect={() => handleChangeType()}
                >
                  Limpar filtro
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="border-dashed">
              <CircleFadingPlus className="h-4 w-4 shrink-0" />
              Status
              {filters.isActive !== undefined && (
                <Separator orientation="vertical" className="h-4 mx-1" />
              )}
              {filters.isActive !== undefined && (
                <div className="inline-flex items-center border py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal">
                  {filters.isActive ? "Ativo" : "Inativo"}
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleChangeStatus("true")}
                  >
                    Ativo
                    <Check
                      className={cn(
                        "h-4 w-4",
                        filters.isActive === true
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleChangeStatus("false")}
                  >
                    Inativo
                    <Check
                      className={cn(
                        "h-4 w-4",
                        filters.isActive === false
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                </CommandGroup>
              </CommandList>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  className="flex justify-center"
                  onSelect={() => handleChangeStatus()}
                >
                  Limpar filtro
                </CommandItem>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <DataTable
        columns={columns}
        data={data?.data?.cashAccounts ?? []}
        loading={isLoading}
        meta={{
          ...meta,
          total: data?.data?.meta.total ?? 0,
          totalPages: data?.data?.meta.totalPages ?? 0,
        }}
        setMeta={setMeta}
      />
    </div>
  );
}
