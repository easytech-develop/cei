"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { USE_GET_CATEGORIES_KEY } from "../../../queries/categories";
import { updateCategory } from "../../../server/categories";
import type { CategoryResponse } from "../../../types/categories";
import type { UpdateCategorySchema } from "../../../validators/categories";
import { updateCategorySchema } from "../../../validators/categories";

interface UpdateCategoryProps {
  trigger: ReactElement;
  category: CategoryResponse;
}

const directionOptions = [
  { value: "IN", label: "Entrada" },
  { value: "OUT", label: "Saída" },
];

export default function UpdateCategory({
  trigger,
  category,
}: UpdateCategoryProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<UpdateCategorySchema>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      id: category.id,
      name: category.name,
      direction: category.direction,
      description: category.description || undefined,
      accountId: category.accountId || undefined,
    },
  });

  // Atualizar valores do formulário quando a categoria mudar
  useEffect(() => {
    form.reset({
      id: category.id,
      name: category.name,
      direction: category.direction,
      description: category.description || undefined,
      accountId: category.accountId || undefined,
    });
  }, [category, form]);

  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        setOpen(false);
        queryClient.invalidateQueries({
          queryKey: USE_GET_CATEGORIES_KEY,
        });
      } else {
        toast.error(response.message);
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar categoria");
    },
  });

  function onSubmit(data: UpdateCategorySchema) {
    updateCategoryMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atualizar Categoria</DialogTitle>
          <DialogDescription>
            Atualize as informações da categoria selecionada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direção</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a direção" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {directionOptions.map((direction) => (
                        <SelectItem
                          key={direction.value}
                          value={direction.value}
                        >
                          {direction.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Descrição da categoria (opcional)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateCategoryMutation.isPending}>
                {updateCategoryMutation.isPending
                  ? "Atualizando..."
                  : "Atualizar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
