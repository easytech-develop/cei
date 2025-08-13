"use client";

import type { User } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { queryClient } from "@/lib/queries/query-client";
import { USE_GET_USERS_KEY } from "../../queries/users";
import { deleteUser } from "../../server/users";

type DeleteUserProps = {
  trigger: React.ReactNode;
  user: User;
};

export default function DeleteUser({ trigger, user }: DeleteUserProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    setIsSubmitting(true);
    const response = await deleteUser(user.id);
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: USE_GET_USERS_KEY });
      setOpen(false);
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir usuário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o usuário {user.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={onSubmit}
            loading={isSubmitting}
            variant="destructive"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
