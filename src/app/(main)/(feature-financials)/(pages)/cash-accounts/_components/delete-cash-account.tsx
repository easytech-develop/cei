"use client";

import type { CashAccount } from "@prisma/client";
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
import { queryClient } from "@/lib/queries/query-client";
import { USE_GET_CASH_ACCOUNTS_KEY } from "../../../queries/cash-accounts";
import { deleteCashAccount } from "../../../server/cash-accounts";
import type { CashAccountResponse } from "../../../types/cash-accounts";

type DeleteCashAccountProps = {
  trigger: React.ReactNode;
  cashAccount: CashAccountResponse;
  onSuccess?: (data: CashAccount) => void;
};

export default function DeleteCashAccount({
  trigger,
  cashAccount,
  onSuccess,
}: DeleteCashAccountProps) {
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    const promise = deleteCashAccount(cashAccount.id);

    toast.promise(promise, {
      loading: 'Excluindo conta bancária...',
      success: (response) => {
        if (response.success && response.data?.cashAccount) {
          queryClient.invalidateQueries({ queryKey: USE_GET_CASH_ACCOUNTS_KEY });
          onSuccess?.(response.data.cashAccount);
          setOpen(false);
          return response.message;
        } else {
          throw new Error(response.message);
        }
      },
      error: (error) => {
        return error.message || 'Erro ao excluir conta bancária';
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Conta Bancária</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a conta bancária{" "}
            <strong>{cashAccount.name}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita. A conta será marcada como excluída e
            não aparecerá mais nas listagens.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
