"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { useGetCategories } from "../../../../queries/categories";
import type { CategoryWithChildren } from "../../../../types/categories";
import type { CreateCategorySchema } from "../../../../validators/categories";
import { createCategorySchema } from "../../../../validators/categories";

interface CategoryFormProps {
  initialData?: CategoryWithChildren;
  onSubmit: (data: CreateCategorySchema) => void;
  isLoading?: boolean;
  submitLabel: React.ReactNode;
}

export default function CategoryForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel,
}: CategoryFormProps) {
  const { data: categoriesData } = useGetCategories({
    meta: { page: 1, limit: 1000 },
    filters: { parentId: null },
  });

  const parentCategories =
    categoriesData?.categories.filter(
      (category) => category.id !== initialData?.id,
    ) || [];

  const form = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      parentId: initialData?.parentId || undefined,
    },
  });

  const handleSubmit = (data: CreateCategorySchema) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: ALIMENTACAO"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Alimentação"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria Pai (Opcional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value || undefined)}
                value={field.value || ""}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria pai" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parentCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
