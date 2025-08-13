"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { USE_GET_VENDORS_KEY } from "../../../queries/vendors";
import { updateVendor } from "../../../server/vendors";
import type { VendorWithExpenses } from "../../../types/vendors";
import VendorForm from "./vendor-form";

interface UpdateVendorProps {
  vendor: VendorWithExpenses;
  trigger: React.ReactNode;
}

export default function UpdateVendor({ vendor, trigger }: UpdateVendorProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: updateVendor,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: USE_GET_VENDORS_KEY });
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar fornecedor");
    },
  });

  const handleSubmit = (data: any) => {
    mutate({
      id: vendor.id,
      ...data,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Fornecedor</DialogTitle>
          <DialogDescription>
            Atualize os dados do fornecedor "{vendor.name}".
          </DialogDescription>
        </DialogHeader>
        <VendorForm
          initialData={vendor}
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
