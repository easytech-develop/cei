"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { USE_GET_ACCOUNTS_KEY } from "../../../queries/accounts";
import { deleteAccount } from "../../../server/accounts";
import type { AccountWithParent } from "../../../types/accounts";

interface DeleteAccountProps {
  account: AccountWithParent;
}

export default function DeleteAccount({ account }: DeleteAccountProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        setOpen(false);
        queryClient.invalidateQueries({
          queryKey: USE_GET_ACCOUNTS_KEY,
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erro ao excluir conta");
    },
  });

  function handleDelete() {
    deleteAccountMutation.mutate(account.id);
  }

  const hasChildren = false;
  const hasCategories = false;
  const hasJournalLines = false;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Excluir Conta Contábil</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a conta "{account.name}"?
          </DialogDescription>
        </DialogHeader>

        {(hasChildren || hasCategories || hasJournalLines) && (
          <div className="space-y-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
              Atenção: Esta conta possui relacionamentos
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Verificação de relacionamentos desabilitada</li>
            </ul>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              A exclusão só será possível após remover todos os relacionamentos.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteAccountMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={
              deleteAccountMutation.isPending ||
              hasChildren ||
              hasCategories ||
              hasJournalLines
            }
          >
            {deleteAccountMutation.isPending ? "Excluindo..." : "Excluir Conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
