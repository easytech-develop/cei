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
import { useDeleteExpense } from "../../../queries/expenses";
import type { ExpenseWithRelations } from "../../../types/expenses";

interface DeleteExpenseProps {
  expense: ExpenseWithRelations;
  trigger: React.ReactNode;
}

export default function DeleteExpense({
  expense,
  trigger,
}: DeleteExpenseProps) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useDeleteExpense();

  const handleDelete = () => {
    mutate(expense.id, {
      onSuccess: () => {
        toast.success("Despesa excluída com sucesso!");
        setOpen(false);
      },
      onError: () => {
        toast.error("Erro ao excluir despesa");
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Despesa</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a despesa "{expense.description}"?
            Esta ação não pode ser desfeita.
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
