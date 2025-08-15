"use client";

import type { ContactRole } from "@prisma/client";
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
import { cn, mask } from "@/lib/utils";
import type { Meta } from "@/types/generics";
import { useGetContacts } from "../../../queries/contacts";
import type { ContactResponse } from "../../../types/contacts";
import DeleteContact from "./delete-contact";
import UpdateContact from "./update-contact";

const columns: ColumnDef<ContactResponse>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "document",
    header: "Documento",
    cell: ({ row }) => {
      const document = row.original.document;
      return document ? mask.cpfOrCnpj(document) : "-";
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.email;
      return email || "-";
    },
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.original.phone;
      return phone ? mask.phone(phone) : "-";
    },
  },
  {
    accessorKey: "roles",
    header: "Função",
    cell: ({ row }) => {
      const roles = row.original.roles;
      const displayRoles = roles.slice(0, 2);
      const remainingCount = roles.length - 2;

      return (
        <div className="flex flex-wrap gap-2">
          {displayRoles.map((role) => (
            <Badge key={role} className="whitespace-nowrap">
              {role === "CUSTOMER" ? "Cliente" : "Fornecedor"}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="secondary">+{remainingCount}</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <UpdateContact
            trigger={
              <Button size="icon" variant="ghost">
                <Edit />
              </Button>
            }
            contact={row.original}
          />
          <DeleteContact
            trigger={
              <Button size="icon" variant="ghost">
                <Trash2 />
              </Button>
            }
            contact={row.original}
          />
        </div>
      );
    },
  },
];

const roleOptions = [
  { value: "CUSTOMER", label: "Cliente" },
  { value: "SUPPLIER", label: "Fornecedor" },
];

export default function ListContacts() {
  const [filters, setFilters] = useState({
    search: "",
    roles: [] as ContactRole[],
  });
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetContacts({ meta, filters });

  function handleChangeRole(role?: string) {
    if (!role) {
      setFilters({ ...filters, roles: [] });
    } else if (filters.roles.includes(role as ContactRole)) {
      setFilters({
        ...filters,
        roles: filters.roles.filter((item) => item !== role),
      });
    } else {
      setFilters({
        ...filters,
        roles: [...filters.roles, role as ContactRole],
      });
    }
  }

  useEffect(() => {
    if (window) {
      const storageMeta = localStorage.getItem("list-contacts-meta");
      const storageFilters = localStorage.getItem("list-contacts-filters");

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
              Função
              {filters.roles.length > 0 && (
                <Separator orientation="vertical" className="h-4 mx-1" />
              )}
              {filters.roles.length > 0 && (
                <div className="inline-flex items-center border py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal">
                  {filters.roles.length} selecionado
                  {filters.roles.length > 1 && "s"}
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar função..." />
              <CommandList>
                <CommandGroup>
                  {roleOptions.map((role) => (
                    <CommandItem
                      key={role.value}
                      onSelect={() => {
                        handleChangeRole(role.value);
                      }}
                    >
                      {role.label}
                      <Check
                        className={cn(
                          "h-4 w-4",
                          filters.roles.includes(role.value as ContactRole)
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
                  onSelect={() => handleChangeRole()}
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
        data={data?.contacts ?? []}
        loading={isLoading}
        meta={{
          ...meta,
          total: data?.meta.total ?? 0,
          totalPages: data?.meta.totalPages ?? 0,
        }}
        setMeta={setMeta}
      />
    </div>
  );
}
