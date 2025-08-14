"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Loader2, Tag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Meta } from "@/types/generics";
import { useGetCategories } from "../../../../queries/categories";
import type { CategoryWithChildren } from "../../../../types/categories";
import DeleteCategory from "./delete-category";
import UpdateCategory from "./update-category";

const columns: ColumnDef<CategoryWithChildren>[] = [
  {
    accessorKey: "code",
    header: "Código",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono">{row.original.code}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      return (
        <div
          className="max-w-[300px] truncate"
          title={row.original.name}
        >
          {row.original.name}
        </div>
      );
    },
  },
  {
    accessorKey: "parent",
    header: "Categoria Pai",
    cell: ({ row }) => {
      const parent = row.original.parent;
      return (
        <div className="max-w-[200px] truncate" title={parent?.name || ""}>
          {parent?.name || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "children",
    header: "Subcategorias",
    cell: ({ row }) => {
      const childrenCount = row.original.children.length;
      return (
        <div className="text-center">
          <span className="text-sm text-muted-foreground">
            {childrenCount} {childrenCount === 1 ? "subcategoria" : "subcategorias"}
          </span>
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
          <UpdateCategory
            trigger={
              <Button size="icon" variant="ghost">
                <Edit />
              </Button>
            }
            category={row.original}
          />
          <DeleteCategory
            trigger={
              <Button size="icon" variant="ghost">
                <Trash2 />
              </Button>
            }
            category={row.original}
          />
        </div>
      );
    },
  },
];

export default function ListCategories() {
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10 });
  const [filters, setFilters] = useState<{
    search?: string;
    parentId?: string | null | undefined;
  }>({});

  const { data, isLoading, refetch } = useGetCategories({
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

  const clearFilters = () => {
    setFilters({});
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const categories = data?.categories || [];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar por código ou nome..."
            value={filters.search || ""}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Botão Limpar Filtros */}
        {filters.search && (
          <Button variant="outline" onClick={clearFilters}>
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Tabela */}
      <DataTable
        columns={columns}
        data={categories}
        loading={isLoading}
        meta={data?.meta}
        setMeta={setMeta}
      />
    </div>
  );
}
