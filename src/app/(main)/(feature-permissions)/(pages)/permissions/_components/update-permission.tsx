"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Permission } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type UpdatePermissionSchema,
  updatePermissionSchema,
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
import { updatePermission } from "../../../server/permissions";

type UpdatePermissionProps = {
  permission: Permission;
  trigger: React.ReactNode;
  onSuccess?: (data: Permission) => void;
};

export default function UpdatePermission({ permission, trigger, onSuccess }: UpdatePermissionProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdatePermissionSchema>({
    defaultValues: {
      id: permission.id,
      name: permission.name,
      description: permission.description || "",
      resource: permission.resource,
      action: permission.action,
    },
    resolver: zodResolver(updatePermissionSchema),
  });

  async function onSubmit(data: UpdatePermissionSchema) {
    setIsSubmitting(true);
    const response = await updatePermission(data);
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
    if (open) {
      form.reset({
        id: permission.id,
        name: permission.name,
        description: permission.description || "",
        resource: permission.resource,
        action: permission.action,
      });
    }
  }, [open, form, permission]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar permissão</DialogTitle>
          <DialogDescription>
            Edite as informações da permissão.
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
                Salvar alterações
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
