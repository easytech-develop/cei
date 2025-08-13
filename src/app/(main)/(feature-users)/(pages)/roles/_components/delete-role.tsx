"use client";

import type { Role } from "@prisma/client";
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
import { USE_GET_ROLES_KEY } from "../../../queries/roles";
import { deleteRole } from "../../../server/roles";

type DeleteRoleProps = {
  trigger: React.ReactNode;
  role: Role;
};

export default function DeleteRole({ trigger, role }: DeleteRoleProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit() {
    setIsSubmitting(true);
    const response = await deleteRole(role.id);
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: USE_GET_ROLES_KEY });
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
          <DialogTitle>Excluir função</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o função {role.name} ({role.slug})?
            <br />
            <br />
            <strong>Atenção:</strong> Esta ação não pode ser desfeita e só será possível se não houver usuários associados a este função.
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
