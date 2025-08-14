"use client";

import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateCategory } from "../../../../queries/categories";
import type { CategoryWithChildren } from "../../../../types/categories";
import type { CreateCategorySchema } from "../../../../validators/categories";
import CategoryForm from "./category-form";

interface UpdateCategoryProps {
  category: CategoryWithChildren;
  trigger: React.ReactNode;
}

export default function UpdateCategory({
  category,
  trigger,
}: UpdateCategoryProps) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useUpdateCategory();

  const handleSubmit = (data: CreateCategorySchema) => {
    mutate(
      {
        ...data,
        id: category.id,
      },
      {
        onSuccess: () => {
          toast.success("Categoria atualizada com sucesso!");
          setOpen(false);
        },
        onError: () => {
          toast.error("Erro ao atualizar categoria");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Categoria</DialogTitle>
          <DialogDescription>
            Atualize os dados da categoria "{category.name}".
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          initialData={category}
          onSubmit={handleSubmit}
          isLoading={isPending}
          submitLabel={
            isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Atualizar
              </>
            )
          }
        />
      </DialogContent>
    </Dialog>
  );
}
