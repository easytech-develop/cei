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
import { useUpdateExpense } from "../../../queries/expenses";
import type { ExpenseWithRelations } from "../../../types/expenses";
import type { CreateExpenseSchema } from "../../../validators/expenses";
import ExpenseForm from "./expense-form";

interface UpdateExpenseProps {
  expense: ExpenseWithRelations;
  trigger: React.ReactNode;
}

export default function UpdateExpense({
  expense,
  trigger,
}: UpdateExpenseProps) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useUpdateExpense();

  const handleSubmit = (data: CreateExpenseSchema) => {
    mutate(
      {
        ...data,
        id: expense.id,
      },
      {
        onSuccess: () => {
          toast.success("Despesa atualizada com sucesso!");
          setOpen(false);
        },
        onError: () => {
          toast.error("Erro ao atualizar despesa");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Atualizar Despesa</DialogTitle>
          <DialogDescription>
            Atualize os dados da despesa "{expense.description}".
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          initialData={expense}
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
