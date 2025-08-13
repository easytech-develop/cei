"use client";

import type { Permission } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Meta } from "@/types/generics";
import { useGetPermissions } from "../../../queries/permissions";
import DeletePermission from "./delete-permission";
import UpdatePermission from "./update-permission";

const columns: ColumnDef<Permission>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "resource",
    header: "Recurso",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.resource}</Badge>;
    },
  },
  {
    accessorKey: "action",
    header: "Ação",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.original.action}</Badge>;
    },
  },
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ row }) => {
      return <span className="font-mono text-sm">{row.original.code}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {row.original.description || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <UpdatePermission
            permission={row.original}
            trigger={
              <Button size="icon" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
            }
          />
          <DeletePermission
            permission={row.original}
            trigger={
              <Button size="icon" variant="ghost">
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      );
    },
  },
];

export default function ListPermissions() {
  const [filters, setFilters] = useState({
    search: "",
    resource: "",
    action: "",
  });
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetPermissions({ meta, filters });

  useEffect(() => {
    if (window) {
      const storageMeta = localStorage.getItem("list-permissions-meta");
      const storageFilters = localStorage.getItem("list-permissions-filters");

      if (storageMeta) {
        setMeta(JSON.parse(storageMeta));
      }

      if (storageFilters) {
        setFilters(JSON.parse(storageFilters));
      }
    }
  }, []);

  useEffect(() => {
    if (window) {
      localStorage.setItem("list-permissions-meta", JSON.stringify(meta));
      localStorage.setItem("list-permissions-filters", JSON.stringify(filters));
    }
  }, [meta, filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Pesquisar permissões..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="w-full lg:max-w-xs"
        />
        <Input
          placeholder="Filtrar por recurso..."
          value={filters.resource}
          onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
          className="w-full sm:w-48"
        />
        <Input
          placeholder="Filtrar por ação..."
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          className="w-full sm:w-48"
        />
      </div>
      <DataTable
        columns={columns}
        data={data?.data?.permissions ?? []}
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
