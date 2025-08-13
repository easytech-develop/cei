"use client";

import type { Permission } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { queryClient } from "@/lib/queries/query-client";
import { USE_GET_PERMISSIONS_KEY } from "../../../queries/permissions";
import { deletePermission } from "../../../server/permissions";

type DeletePermissionProps = {
  permission: Permission;
  trigger: React.ReactNode;
  onSuccess?: () => void;
};

export default function DeletePermission({ permission, trigger, onSuccess }: DeletePermissionProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const response = await deletePermission(permission.id);
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: USE_GET_PERMISSIONS_KEY });
      onSuccess?.();
      toast.success(response.message);
      setOpen(false);
    } else {
      toast.error(response.message);
    }
    setIsDeleting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir permissão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a permissão "{permission.name}"?
            <br />
            <br />
            <strong>Esta ação não pode ser desfeita.</strong>
            <br />
            <br />
            <span className="text-sm text-muted-foreground">
              Código: {permission.code}
              <br />
              Recurso: {permission.resource}
              <br />
              Ação: {permission.action}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isDeleting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            loading={isDeleting}
          >
            Excluir permissão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
