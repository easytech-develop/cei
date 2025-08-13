"use client";

import type { Role } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Meta } from "@/types/generics";
import { useGetRoles } from "../../../queries/roles";
import DeleteRole from "./delete-role";
import UpdateRole from "./update-role";
import ManageRolePermissions from "@/app/(main)/(feature-permissions)/(pages)/permissions/_components/manage-role-permissions";

const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.slug}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => {
      return new Date(row.original.createdAt).toLocaleDateString("pt-BR");
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <ManageRolePermissions
            trigger={
              <Button size="icon" variant="ghost" title="Gerenciar permissões">
                <Shield className="h-4 w-4" />
              </Button>
            }
            role={row.original}
          />
          <UpdateRole
            trigger={
              <Button size="icon" variant="ghost">
                <Edit />
              </Button>
            }
            role={row.original}
          />
          <DeleteRole
            trigger={
              <Button size="icon" variant="ghost">
                <Trash2 />
              </Button>
            }
            role={row.original}
          />
        </div>
      );
    },
  },
];

export default function ListRoles() {
  const [filters, setFilters] = useState({
    search: "",
  });
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetRoles({ meta, filters });

  useEffect(() => {
    if (window) {
      const storageMeta = localStorage.getItem("list-roles-meta");
      const storageFilters = localStorage.getItem("list-roles-filters");

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
      <Input
        placeholder="Pesquisar"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="w-full lg:max-w-xs"
      />
      <DataTable
        columns={columns}
        data={data?.roles ?? []}
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
