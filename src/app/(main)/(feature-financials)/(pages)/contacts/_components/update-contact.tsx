"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Contact, ContactRole } from "@prisma/client";
import { Check, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type UpdateContactSchema,
  updateContactSchema,
} from "@/app/(main)/(feature-financials)/validators/contacts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queries/query-client";
import { cn, mask } from "@/lib/utils";
import { USE_GET_CONTACTS_KEY } from "../../../queries/contacts";
import { updateContact } from "../../../server/contacts";
import type { ContactResponse } from "../../../types/contacts";

type UpdateContactProps = {
  trigger: React.ReactNode;
  contact: ContactResponse;
  onSuccess?: (data: Contact) => void;
};

const roleOptions = [
  { value: "CUSTOMER", label: "Cliente" },
  { value: "SUPPLIER", label: "Fornecedor" },
];

export default function UpdateContact({
  trigger,
  contact,
  onSuccess,
}: UpdateContactProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateContactSchema>({
    defaultValues: {
      id: contact.id,
      name: contact.name,
      document: contact.document || "",
      email: contact.email || "",
      phone: contact.phone || "",
      address: contact.address || "",
      roles: contact.roles,
    },
    resolver: zodResolver(updateContactSchema),
  });

  async function onSubmit(data: UpdateContactSchema) {
    setIsSubmitting(true);
    const response = await updateContact(data);
    if (response.success && response.data?.contact) {
      queryClient.invalidateQueries({ queryKey: USE_GET_CONTACTS_KEY });
      onSuccess?.(response.data.contact);
      toast.success(response.message);
      setOpen(false);
    } else {
      toast.error(response.message);
    }
    setIsSubmitting(false);
  }

  function handleChangeRole(role?: string) {
    if (!role) {
      form.setValue("roles", []);
    } else if (form.getValues("roles").includes(role as ContactRole)) {
      form.setValue(
        "roles",
        form.getValues("roles").filter((item) => item !== role),
      );
    } else {
      form.setValue("roles", [...form.getValues("roles"), role as ContactRole]);
    }
  }

  useEffect(() => {
    if (open) {
      form.reset({
        id: contact.id,
        name: contact.name,
        document: contact.document || "",
        email: contact.email || "",
        phone: contact.phone || "",
        address: contact.address || "",
        roles: contact.roles,
      });
    }
  }, [open, contact, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar contato</DialogTitle>
          <DialogDescription>
            Atualize as informações do contato.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento (CPF/CNPJ)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      value={mask.cpfOrCnpj(field.value || "")}
                      onChange={(e) => {
                        const maskedValue = mask.cpfOrCnpj(e.target.value);
                        field.onChange(maskedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="(00) 00000-0000"
                        value={mask.phone(field.value || "")}
                        onChange={(e) => {
                          const maskedValue = mask.phone(e.target.value);
                          field.onChange(maskedValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Endereço completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <button type="button" className={selectTriggerClass}>
                          {field.value.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1 max-w-[calc(100%-20px)]">
                              {field.value
                                .map((role) => {
                                  const option = roleOptions.find(
                                    (option) => option.value === role,
                                  );
                                  return option ? (
                                    <Badge
                                      key={role}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {option.label}
                                    </Badge>
                                  ) : null;
                                })
                                .filter(Boolean)}
                            </div>
                          ) : (
                            "Selecione a função"
                          )}{" "}
                          <ChevronDownIcon className="size-4 opacity-50" />
                        </button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar função..." />
                        <CommandList>
                          <CommandGroup>
                            {roleOptions.map((role) => (
                              <CommandItem
                                key={role.value}
                                onSelect={() => {
                                  handleChangeRole(role.value);
                                }}
                              >
                                {role.label}
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    field.value.includes(
                                      role.value as ContactRole,
                                    )
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            className="flex justify-center"
                            onSelect={() => handleChangeRole()}
                          >
                            Limpar seleção
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" loading={isSubmitting}>
                Atualizar contato
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
