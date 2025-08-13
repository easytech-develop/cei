"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Check, CircleFadingPlus, Edit, Loader2, Trash2, User } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Meta } from "@/types/generics";
import { useGetRoles } from "../../../queries/roles";
import { useGetUsers } from "../../../queries/users";
import type { UserWithRoles } from "../../../types/users";
import DeleteUser from "./delete-user";
import UpdateUser from "./update-user";
import ManageUserPermissions from "@/app/(main)/(feature-permissions)/(pages)/permissions/_components/manage-user-permissions";

const columns: ColumnDef<UserWithRoles>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "roles",
    header: "Cargo",
    cell: ({ row }) => {
      const roles = row.original.roles;
      const displayRoles = roles.slice(0, 2);
      const remainingCount = roles.length - 2;

      return (
        <div className="flex flex-wrap gap-2">
          {displayRoles.map((role) => (
            <Badge key={role.id} className="whitespace-nowrap">
              {role.name}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="secondary">
              +{remainingCount}
            </Badge>
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
          <ManageUserPermissions
            trigger={
              <Button size="icon" variant="ghost" title="Gerenciar permissões">
                <User className="h-4 w-4" />
              </Button>
            }
            user={row.original}
          />
          <UpdateUser
            trigger={
              <Button size="icon" variant="ghost">
                <Edit />
              </Button>
            }
            user={row.original}
          />
          <DeleteUser
            trigger={
              <Button size="icon" variant="ghost">
                <Trash2 />
              </Button>
            }
            user={row.original}
          />
        </div>
      );
    },
  },
];

export default function ListUsers() {
  const [filters, setFilters] = useState({
    search: "",
    roles: [] as string[],
  });
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetUsers({ meta, filters });
  const { data: roles, isLoading: isLoadingRoles } = useGetRoles();

  function handleChangeRole(roleId?: string) {
    if (!roleId) {
      setFilters({ ...filters, roles: [] });
    } else if (filters.roles.includes(roleId)) {
      setFilters({ ...filters, roles: filters.roles.filter((item) => item !== roleId) });
    } else {
      setFilters({ ...filters, roles: [...filters.roles, roleId] });
    }
  }

  useEffect(() => {
    if (window) {
      const storageMeta = localStorage.getItem("list-users-meta");
      const storageFilters = localStorage.getItem("list-users-filters");

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
            <Button
              variant="outline"
              className="border-dashed"
            >
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
                {isLoadingRoles && (
                  <CommandItem className="flex items-center gap-2" disabled>
                    <Loader2 className="w-4 h-4 animate-spin" /> Carregando
                    dados...
                  </CommandItem>
                )}
                <CommandGroup>
                  {roles?.roles.map((role) => (
                    <CommandItem
                      key={role.id}
                      onSelect={() => {
                        handleChangeRole(role.id);
                      }}
                    >
                      {role.name}
                      <Check
                        className={cn(
                          "h-4 w-4",
                          filters.roles.includes(role.id)
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
        data={data?.users ?? []}
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
