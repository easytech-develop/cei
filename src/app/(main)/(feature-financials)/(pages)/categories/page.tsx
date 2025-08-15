import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateCategory from "./_components/create-category";
import ListCategories from "./_components/list-categories";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias de documentos financeiros.
          </p>
        </div>
        <CreateCategory
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          }
        />
      </div>
      <ListCategories />
    </div>
  );
}
