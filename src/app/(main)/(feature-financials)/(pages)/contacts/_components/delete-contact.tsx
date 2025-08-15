"use client";

import type { Contact } from "@prisma/client";
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
import { USE_GET_CONTACTS_KEY } from "../../../queries/contacts";
import { deleteContact } from "../../../server/contacts";
import type { ContactResponse } from "../../../types/contacts";

type DeleteContactProps = {
  trigger: React.ReactNode;
  contact: ContactResponse;
  onSuccess?: (data: Contact) => void;
};

export default function DeleteContact({ trigger, contact, onSuccess }: DeleteContactProps) {
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    const deletePromise = deleteContact(contact.id);

    toast.promise(deletePromise, {
      loading: "Excluindo contato...",
      success: (response) => {
        if (response.success && response.data?.contact) {
          queryClient.invalidateQueries({ queryKey: USE_GET_CONTACTS_KEY });
          onSuccess?.(response.data.contact);
          setOpen(false);
          return response.message;
        } else {
          throw new Error(response.message);
        }
      },
      error: (error) => {
        return error.message || "Erro ao excluir contato";
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir contato</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o contato <strong>{contact.name}</strong>?
            Esta ação não pode ser desfeita.
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
