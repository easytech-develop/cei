"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Role } from "@prisma/client";
import { Dialog } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type UpdateRoleSchema,
  updateRoleSchema,
} from "@/app/(main)/(feature-users)/validators/roles";
import { Button } from "@/components/ui/button";
import {
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
import { queryClient } from "@/lib/queries/query-client";
import { USE_GET_ROLES_KEY } from "../../../queries/roles";
import { updateRole } from "../../../server/roles";

type UpdateRoleProps = {
  trigger: React.ReactNode;
  role: Role;
  onSuccess?: (data: Role) => void;
};

export default function UpdateRole({
  trigger,
  role,
  onSuccess,
}: UpdateRoleProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateRoleSchema>({
    defaultValues: {
      id: role.id,
      name: role.name,
      slug: role.slug,
    },
    resolver: zodResolver(updateRoleSchema),
  });

  async function onSubmit(data: UpdateRoleSchema) {
    setIsSubmitting(true);
    const response = await updateRole(data);
    if (response.success && response.data?.role) {
      queryClient.invalidateQueries({ queryKey: USE_GET_ROLES_KEY });
      onSuccess?.(response.data.role);
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
        id: role.id,
        name: role.name,
        slug: role.slug,
      });
    }
  }, [open, form, role]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar função</DialogTitle>
          <DialogDescription>
            Atualize as informações do função selecionado.
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
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: ADMIN, DIRECTOR, TEACHER"
                      onChange={(e) => {
                        field.onChange(e.target.value.toUpperCase());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
              <DialogClose asChild>
                <Button variant="outline" disabled={isSubmitting} type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" loading={isSubmitting}>
                Atualizar função
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
