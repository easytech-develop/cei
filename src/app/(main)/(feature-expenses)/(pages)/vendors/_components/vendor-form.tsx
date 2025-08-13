"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileText, Mail, Phone } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import type { VendorWithExpenses } from "../../../types/vendors";
import type { CreateVendorSchema } from "../../../validators/vendors";
import { createVendorSchema } from "../../../validators/vendors";

interface VendorFormProps {
  initialData?: VendorWithExpenses;
  onSubmit: (data: CreateVendorSchema) => void;
  isLoading?: boolean;
  submitLabel?: React.ReactNode;
}

export default function VendorForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Salvar",
}: VendorFormProps) {
  const form = useForm<CreateVendorSchema>({
    resolver: zodResolver(createVendorSchema),
    defaultValues: {
      name: initialData?.name || "",
      document: initialData?.document || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      active: Boolean(initialData?.active ?? true),
    },
  });

  const handleSubmit = (data: CreateVendorSchema) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Nome
              </FormLabel>
              <FormControl>
                <Input placeholder="Nome do fornecedor" {...field} />
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
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CPF/CNPJ
              </FormLabel>
              <FormControl>
                <Input placeholder="CPF ou CNPJ" {...field} />
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
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  {...field}
                />
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
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </FormLabel>
              <FormControl>
                <Input placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Ativo</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Marque se o fornecedor está ativo
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

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
