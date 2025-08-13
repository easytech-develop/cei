"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Permission } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type CreatePermissionSchema,
  createPermissionSchema,
} from "@/app/(main)/(feature-permissions)/validators/permissions";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queries/query-client";
import { USE_GET_PERMISSIONS_KEY } from "../../../queries/permissions";
import { createPermission } from "../../../server/permissions";

type CreatePermissionProps = {
  trigger: React.ReactNode;
  onSuccess?: (data: Permission) => void;
};

export default function CreatePermission({ trigger, onSuccess }: CreatePermissionProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreatePermissionSchema>({
    defaultValues: {
      name: "",
      description: "",
      resource: "",
      action: "",
    },
    resolver: zodResolver(createPermissionSchema),
  });

  async function onSubmit(data: CreatePermissionSchema) {
    setIsSubmitting(true);
    const response = await createPermission(data);
    if (response.success && response.data?.permission) {
      queryClient.invalidateQueries({ queryKey: USE_GET_PERMISSIONS_KEY });
      onSuccess?.(response.data.permission);
      toast.success(response.message);
      setOpen(false);
    } else {
      toast.error(response.message);
    }
    setIsSubmitting(false);
  }

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar permissão</DialogTitle>
          <DialogDescription>
            Crie uma nova permissão para o sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Criar usuário" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descrição opcional da permissão"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="resource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurso</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: user, expense, role" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ação</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: create, read, update, delete" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" loading={isSubmitting}>
                Criar permissão
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
