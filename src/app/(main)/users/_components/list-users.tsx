"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { useGetUsers } from "@/lib/queries/users";
import type { UserWithRoles } from "@/server/users";
import type { Meta } from "@/types/generics";

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
    header: "Roles",
    cell: ({ row }) => {
      return (
        <div>{row.original.roles.map((role) => role.name).join(", ")}</div>
      );
    },
  },
];

export default function ListUsers() {
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetUsers({ meta });

  useEffect(() => {
    if (window) {
      const storage = localStorage.getItem("list-users-meta");
      if (storage) {
        setMeta(JSON.parse(storage));
      }
    }
  }, []);

  return (
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
  );
}
