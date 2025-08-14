"use client";

import { Loader2, Plus } from "lucide-react";
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
import { useCreateCategory } from "../../../../queries/categories";
import type { CreateCategorySchema } from "../../../../validators/categories";
import CategoryForm from "./category-form";

interface CreateCategoryProps {
  trigger: React.ReactNode;
}

export default function CreateCategory({ trigger }: CreateCategoryProps) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useCreateCategory();

  const handleSubmit = (data: CreateCategorySchema) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Categoria criada com sucesso!");
        setOpen(false);
      },
      onError: () => {
        toast.error("Erro ao criar categoria");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria de despesa preenchendo os dados abaixo.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          submitLabel={
            isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Criar
              </>
            )
          }
        />
      </DialogContent>
    </Dialog>
  );
}
