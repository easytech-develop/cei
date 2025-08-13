"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
import { Check, ChevronDownIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type CreateUserSchema,
  createUserSchema,
} from "@/app/(main)/(feature-users)/validators/users";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  selectTriggerClass,
} from "@/components/ui/select";
import { queryClient } from "@/lib/queries/query-client";
import { cn } from "@/lib/utils";
import { useGetRoles } from "../../../queries/roles";
import { USE_GET_USERS_KEY } from "../../../queries/users";
import { createUser } from "../../../server/users";

type CreateUserProps = {
  trigger: React.ReactNode;
  onSuccess?: (data: User) => void;
};

export default function CreateUser({ trigger, onSuccess }: CreateUserProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoles();
  const roles = rolesData?.roles ?? [];

  const form = useForm<CreateUserSchema>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      status: "ACTIVE",
      roles: [],
    },
    resolver: zodResolver(createUserSchema),
  });

  async function onSubmit(data: CreateUserSchema) {
    setIsSubmitting(true);
    const response = await createUser(data);
    if (response.success && response.data?.user) {
      queryClient.invalidateQueries({ queryKey: USE_GET_USERS_KEY });
      onSuccess?.(response.data.user);
      toast.success(response.message);
      setOpen(false);
    } else {
      toast.error(response.message);
    }
    setIsSubmitting(false);
  }

  function handleChangeRole(roleId?: string) {
    if (!roleId) {
      form.setValue("roles", []);
    } else if (form.getValues("roles").includes(roleId)) {
      form.setValue(
        "roles",
        form.getValues("roles").filter((item) => item !== roleId),
      );
    } else {
      form.setValue("roles", [...form.getValues("roles"), roleId]);
    }
  }

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  useEffect(() => {
    if (roles.length > 0 && !form.getValues("roles")) {
      form.setValue("roles", [roles[0].id]);
    }
  }, [roles, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário para o sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Ativo</SelectItem>
                      <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <button type="button" className={selectTriggerClass}>Função <ChevronDownIcon className="size-4 opacity-50" /></button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar função..." />
                        <CommandList>
                          {isLoadingRoles && (
                            <CommandItem
                              className="flex items-center gap-2"
                              disabled
                            >
                              <Loader2 className="w-4 h-4 animate-spin" />{" "}
                              Carregando dados...
                            </CommandItem>
                          )}
                          <CommandGroup>
                            {roles.map((role) => (
                              <CommandItem
                                key={role.id}
                                onSelect={() => {
                                  handleChangeRole(role.id);
                                }}
                              >
                                {role.name}
                                <Check
                                  className={cn(
                                    "h-4 w-4",
                                    field.value.includes(role.id)
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
                            Limpar filtro
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
                Criar usuário
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
