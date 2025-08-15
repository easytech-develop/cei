"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { CashAccountType } from "@prisma/client";
import { Check, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type UpdateCashAccountSchema,
  updateCashAccountSchema,
} from "@/app/(main)/(feature-financials)/validators/cash-accounts";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { selectTriggerClass } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { queryClient } from "@/lib/queries/query-client";
import { cn, mask } from "@/lib/utils";
import { USE_GET_CASH_ACCOUNTS_KEY } from "../../../queries/cash-accounts";
import { updateCashAccount } from "../../../server/cash-accounts";
import type { CashAccountResponse } from "../../../types/cash-accounts";

type UpdateCashAccountProps = {
  trigger: React.ReactNode;
  cashAccount: CashAccountResponse;
  onSuccess?: (data: CashAccountResponse) => void;
};

const typeOptions = [
  { value: "CASH", label: "Dinheiro" },
  { value: "CHECKING", label: "Conta Corrente" },
  { value: "SAVINGS", label: "Conta Poupança" },
  { value: "INVESTMENT", label: "Investimento" },
  { value: "OTHER", label: "Outro" },
];

export default function UpdateCashAccount({
  trigger,
  cashAccount,
  onSuccess,
}: UpdateCashAccountProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateCashAccountSchema>({
    defaultValues: {
      id: cashAccount.id,
      name: cashAccount.name,
      type: cashAccount.type,
      agency: cashAccount.agency || "",
      accountNumber: cashAccount.accountNumber || "",
      pixKey: cashAccount.pixKey || "",
      accountId: cashAccount.accountId || "",
      openingBalance: cashAccount.openingBalance,
      isActive: cashAccount.isActive,
    },
    resolver: zodResolver(updateCashAccountSchema),
  });

  async function onSubmit(data: UpdateCashAccountSchema) {
    setIsSubmitting(true);
    const response = await updateCashAccount(data);
    if (response.success && response.data?.cashAccount) {
      queryClient.invalidateQueries({ queryKey: USE_GET_CASH_ACCOUNTS_KEY });
      onSuccess?.(response.data.cashAccount);
      toast.success(response.message);
      setOpen(false);
    } else {
      toast.error(response.message);
    }
    setIsSubmitting(false);
  }

  function handleChangeType(type?: string) {
    if (!type) {
      form.setValue("type", "CHECKING");
    } else {
      form.setValue("type", type as CashAccountType);
    }
  }

  useEffect(() => {
    if (open) {
      form.reset({
        id: cashAccount.id,
        name: cashAccount.name,
        type: cashAccount.type,
        agency: cashAccount.agency || "",
        accountNumber: cashAccount.accountNumber || "",
        pixKey: cashAccount.pixKey || "",
        accountId: cashAccount.accountId || "",
        openingBalance: cashAccount.openingBalance,
        isActive: cashAccount.isActive,
      });
    }
  }, [open, cashAccount, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Conta Bancária</DialogTitle>
          <DialogDescription>
            Atualize as informações da conta bancária.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Conta *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Conta Principal" {...field} />
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
                    <FormLabel>Tipo da Conta *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={selectTriggerClass}
                          >
                            {field.value
                              ? typeOptions.find((type) => type.value === field.value)?.label
                              : "Selecione o tipo"}
                            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Buscar tipo..." />
                          <CommandList>
                            <CommandGroup>
                              {typeOptions.map((type) => (
                                <CommandItem
                                  key={type.value}
                                  onSelect={() => handleChangeType(type.value)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === type.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {type.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agência</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Conta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123456-7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="pixKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave PIX</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: contato@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="openingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo Inicial</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => {
                          const maskedValue = mask.currency(e.target.value);
                          field.onChange(maskedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Conta Ativa</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Marque se a conta está ativa para transações
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Atualizando..." : "Atualizar Conta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
