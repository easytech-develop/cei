import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/auth/permissions";
import CreateCategory from "./_components/create-category";
import ListCategories from "./_components/list-categories";

export const metadata: Metadata = {
  title: "Categorias de Despesa",
  description: "Gerencie as categorias de despesa do sistema.",
};

export default async function CategoriesPage() {
  if (!(await can("expense:read"))) {
    redirect("/dashboard?error=no_permission");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Categorias de Despesa
          </h1>
          <p className="text-muted-foreground">
            Gerencie as categorias de despesa do sistema.
          </p>
        </div>
        <CreateCategory
          trigger={
            <Button size="icon">
              <PlusIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      <div className="grid gap-4">
        <ListCategories />
      </div>
    </div>
  );
}
