"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactElement } from "react";
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
import { USE_GET_CATEGORIES_KEY } from "../../../queries/categories";
import { deleteCategory } from "../../../server/categories";
import type { CategoryResponse } from "../../../types/categories";

interface DeleteCategoryProps {
  trigger: ReactElement;
  category: CategoryResponse;
}

export default function DeleteCategory({
  trigger,
  category,
}: DeleteCategoryProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        setOpen(false);
        queryClient.invalidateQueries({
          queryKey: USE_GET_CATEGORIES_KEY,
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erro ao excluir categoria");
    },
  });

  function handleDelete() {
    deleteCategoryMutation.mutate(category.id);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a categoria "{category.name}"? Esta
            ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCategoryMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCategoryMutation.isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
