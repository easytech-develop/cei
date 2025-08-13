"use client";

import type { Role } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Meta } from "@/types/generics";
import { useGetRoles } from "../../../queries/roles";
import DeleteRole from "./delete-role";
import UpdateRole from "./update-role";

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
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetRoles({ meta });

  useEffect(() => {
    if (window) {
      const storage = localStorage.getItem("list-roles-meta");
      if (storage) {
        setMeta(JSON.parse(storage));
      }
    }
  }, []);

  return (
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
  );
}
