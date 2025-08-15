"use client";

import type { DocumentDirection } from "@prisma/client";
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
import { cn } from "@/lib/utils";
import type { Meta } from "@/types/generics";
import { useGetCategories } from "../../../queries/categories";
import type { CategoryResponse } from "../../../types/categories";
import DeleteCategory from "./delete-category";
import UpdateCategory from "./update-category";

const columns: ColumnDef<CategoryResponse>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "direction",
    header: "Direção",
    cell: ({ row }) => {
      const direction = row.original.direction;
      const directionLabels: Record<DocumentDirection, string> = {
        IN: "Entrada",
        OUT: "Saída",
      };
      return (
        <Badge variant={direction === "IN" ? "default" : "secondary"}>
          {directionLabels[direction]}
        </Badge>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.original.description;
      return description || "-";
    },
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return new Date(date).toLocaleDateString("pt-BR");
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

const directionOptions = [
  { value: "IN", label: "Entrada" },
  { value: "OUT", label: "Saída" },
];

export default function ListCategories() {
  const [filters, setFilters] = useState({
    search: "",
    direction: undefined as DocumentDirection | undefined,
  });
  const [meta, setMeta] = useState<Meta>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading } = useGetCategories({ meta, filters });

  function handleChangeDirection(direction?: string) {
    if (!direction) {
      setFilters({ ...filters, direction: undefined });
    } else {
      setFilters({
        ...filters,
        direction: direction as DocumentDirection,
      });
    }
  }

  useEffect(() => {
    const storageMeta = localStorage.getItem("list-categories-meta");
    const storageFilters = localStorage.getItem("list-categories-filters");

    if (storageMeta) {
      setMeta(JSON.parse(storageMeta));
    }

    if (storageFilters) {
      setFilters(JSON.parse(storageFilters));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("list-categories-meta", JSON.stringify(meta));
  }, [meta]);

  useEffect(() => {
    localStorage.setItem("list-categories-filters", JSON.stringify(filters));
  }, [filters]);

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
              Direção
              {filters.direction && (
                <Separator orientation="vertical" className="h-4 mx-1" />
              )}
              {filters.direction && (
                <div className="inline-flex items-center border py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-1 font-normal">
                  {directionOptions.find(d => d.value === filters.direction)?.label}
                </div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar direção..." />
              <CommandList>
                <CommandGroup>
                  {directionOptions.map((direction) => (
                    <CommandItem
                      key={direction.value}
                      onSelect={() => {
                        handleChangeDirection(direction.value);
                      }}
                    >
                      {direction.label}
                      <Check
                        className={cn(
                          "h-4 w-4",
                          filters.direction === direction.value
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
                  onSelect={() => handleChangeDirection()}
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
        data={data?.data?.categories ?? []}
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
