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
import { useCreateExpense } from "../../../queries/expenses";
import type { CreateExpenseSchema } from "../../../validators/expenses";
import ExpenseForm from "./expense-form";

interface CreateExpenseProps {
  trigger: React.ReactNode;
}

export default function CreateExpense({ trigger }: CreateExpenseProps) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useCreateExpense();

  const handleSubmit = (data: CreateExpenseSchema) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Despesa criada com sucesso!");
        setOpen(false);
      },
      onError: () => {
        toast.error("Erro ao criar despesa");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
          <DialogDescription>
            Crie uma nova despesa preenchendo os dados abaixo.
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
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
