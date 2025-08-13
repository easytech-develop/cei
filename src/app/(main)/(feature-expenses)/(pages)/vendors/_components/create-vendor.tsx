"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
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
import { createVendor } from "../../../server/vendors";
import VendorForm from "./vendor-form";

interface CreateVendorProps {
  trigger: React.ReactNode;
}

export default function CreateVendor({ trigger }: CreateVendorProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createVendor,
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
      toast.error("Erro ao criar fornecedor");
    },
  });

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Fornecedor</DialogTitle>
          <DialogDescription>
            Crie um novo fornecedor preenchendo os dados abaixo.
          </DialogDescription>
        </DialogHeader>
        <VendorForm
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
