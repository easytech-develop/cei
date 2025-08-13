"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Meta } from "@/types/generics";
import { useGetUsers } from "../../../queries/users";
import type { UserWithRoles } from "../../../types/users";
import DeleteUser from "./delete-user";
import UpdateUser from "./update-user";

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
      return (
        <div className="flex flex-wrap gap-2">
          {row.original.roles.map((role) => (
            <Badge key={role.id}>{role.name}</Badge>
          ))}
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
