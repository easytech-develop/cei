"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USE_GET_ACCOUNTS_KEY } from "../../../queries/accounts";
import { updateAccount } from "../../../server/accounts";
import type { AccountWithParent } from "../../../types/accounts";
import type { UpdateAccountSchema } from "../../../validators/accounts";
import { updateAccountSchema } from "../../../validators/accounts";

interface UpdateAccountProps {
  account: AccountWithParent;
}

const accountTypeOptions = [
  { value: "ASSET", label: "Ativo" },
  { value: "LIABILITY", label: "Passivo" },
  { value: "EQUITY", label: "Patrimônio Líquido" },
  { value: "REVENUE", label: "Receita" },
  { value: "EXPENSE", label: "Despesa" },
];

export default function UpdateAccount({ account }: UpdateAccountProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<UpdateAccountSchema>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      id: account.id,
      name: account.name,
      code: account.code || "",
      type: account.type,
      parentId: account.parentId || undefined,
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: updateAccount,
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
      toast.error("Erro ao atualizar conta");
    },
  });

  function onSubmit(data: UpdateAccountSchema) {
    updateAccountMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Conta Contábil</DialogTitle>
          <DialogDescription>
            Atualize as informações da conta contábil.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Conta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Caixa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Contábil</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 1.1.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Conta</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={updateAccountMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateAccountMutation.isPending}>
                {updateAccountMutation.isPending
                  ? "Atualizando..."
                  : "Atualizar Conta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
