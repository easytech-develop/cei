"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteCategory } from "../../../../queries/categories";
import type { CategoryWithChildren } from "../../../../types/categories";

interface DeleteCategoryProps {
  category: CategoryWithChildren;
  trigger: React.ReactNode;
}

export default function DeleteCategory({
  category,
  trigger,
}: DeleteCategoryProps) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useDeleteCategory();

  const handleDelete = () => {
    mutate(category.id, {
      onSuccess: () => {
        toast.success("Categoria excluída com sucesso!");
        setOpen(false);
      },
      onError: () => {
        toast.error("Erro ao excluir categoria");
      },
    });
  };

  const hasChildren = category.children.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
          <AlertDialogDescription>
            {hasChildren ? (
              <>
                A categoria "{category.name}" possui {category.children.length}{" "}
                {category.children.length === 1 ? "subcategoria" : "subcategorias"}. 
                Todas as subcategorias também serão excluídas. Tem certeza que deseja continuar?
              </>
            ) : (
              <>
                Tem certeza que deseja excluir a categoria "{category.name}"? 
                Esta ação não pode ser desfeita.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
