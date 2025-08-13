"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Calendar,
  DollarSign,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategories } from "../../../queries/categories";
import { useGetVendors } from "../../../queries/vendors";
import type { ExpenseWithRelations } from "../../../types/expenses";
import type { CreateExpenseSchema, UpdateExpenseSchema } from "../../../validators/expenses";
import { createExpenseSchema } from "../../../validators/expenses";

interface ExpenseFormProps {
  initialData?: ExpenseWithRelations;
  onSubmit: (data: CreateExpenseSchema | UpdateExpenseSchema) => void;
  isLoading?: boolean;
  submitLabel?: React.ReactNode;
}

export default function ExpenseForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Salvar",
}: ExpenseFormProps) {
  const [items, setItems] = useState<
    Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      total: number;
    }>
  >(
    initialData?.Items.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      total: Number(item.total),
    })) || [
      {
        name: "",
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0,
      },
    ],
  );

  const [installments, setInstallments] = useState<
    Array<{
      number: number;
      dueDate: Date;
      amount: number;
      status: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
    }>
  >(
    initialData?.Installments.map((installment) => ({
      number: installment.number,
      dueDate: new Date(installment.dueDate),
      amount: Number(installment.amount),
      status: installment.status as "PENDING" | "PARTIAL" | "PAID" | "CANCELLED",
    })) || [
      {
        number: 1,
        dueDate: new Date(),
        amount: 0,
        status: "PENDING" as const,
      },
    ],
  );

  const { data: vendorsData } = useGetVendors({
    meta: { page: 1, limit: 1000 },
  });

  const { data: categoriesData } = useGetCategories({
    meta: { page: 1, limit: 1000 },
  });

  const form = useForm({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      vendorId: initialData?.vendorId || "",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
      competenceDate: initialData?.competenceDate
        ? new Date(initialData.competenceDate)
        : new Date(),
      issueDate: initialData?.issueDate
        ? new Date(initialData.issueDate)
        : undefined,
      totalNet: initialData ? Number(initialData.totalNet) : 0,
      status: (initialData?.status || "DRAFT") as "DRAFT" | "OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED",
      items: items,
      installments: installments as any,
    },
  });

  const vendors = vendorsData?.vendors || [];
  const categories = categoriesData?.categories || [];

  const calculateItemTotal = (
    quantity: number,
    unitPrice: number,
    discount: number,
  ) => {
    return quantity * unitPrice - discount;
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "unitPrice" || field === "discount") {
      const { quantity, unitPrice, discount } = newItems[index];
      newItems[index].total = calculateItemTotal(quantity, unitPrice, discount);
    }

    setItems(newItems);
    form.setValue("items", newItems);

    // Recalcular total geral
    const totalNet = newItems.reduce((sum, item) => sum + item.total, 0);
    form.setValue("totalNet", totalNet);
  };

  const addItem = () => {
    const newItem = {
      name: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      total: 0,
    };
    setItems([...items, newItem]);
    form.setValue("items", [...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    form.setValue("items", newItems);

    // Recalcular total geral
    const totalNet = newItems.reduce((sum, item) => sum + item.total, 0);
    form.setValue("totalNet", totalNet);
  };

  const updateInstallment = (index: number, field: string, value: any) => {
    const newInstallments = [...installments];
    newInstallments[index] = { ...newInstallments[index], [field]: value };
    setInstallments(newInstallments);
    form.setValue("installments", newInstallments);
  };

  const addInstallment = () => {
    const newInstallment = {
      number: installments.length + 1,
      dueDate: new Date(),
      amount: 0,
      status: "PENDING" as const,
    };
    setInstallments([...installments, newInstallment]);
    form.setValue("installments", [...installments, newInstallment] as any);
  };

  const removeInstallment = (index: number) => {
    const newInstallments = installments.filter((_, i) => i !== index);
    // Renumerar as parcelas
    newInstallments.forEach((installment, i) => {
      installment.number = i + 1;
    });
    setInstallments(newInstallments);
    form.setValue("installments", newInstallments);
  };

  const handleSubmit = (data: CreateExpenseSchema | UpdateExpenseSchema) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vendorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Fornecedor
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um fornecedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Categoria
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
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

              <FormField
                control={form.control}
                name="competenceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data de Competência
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data de Emissão (opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? new Date(e.target.value)
                              : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a despesa..." {...field} />
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
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="OPEN">Aberta</SelectItem>
                      <SelectItem value="PARTIALLY_PAID">
                        Parcialmente Paga
                      </SelectItem>
                      <SelectItem value="PAID">Paga</SelectItem>
                      <SelectItem value="CANCELLED">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Itens */}
        <Card>
          <CardHeader>
            <CardTitle>Itens da Despesa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div
                key={`item-${index}-${item.name}`}
                className="grid grid-cols-12 gap-2 items-end"
              >
                <div className="col-span-4">
                  <Label>Nome</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    placeholder="Nome do item"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Qtd</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Preço Unit.</Label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(index, "unitPrice", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Desconto</Label>
                  <Input
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                      updateItem(index, "discount", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-1">
                  <Label>Total</Label>
                  <Input
                    value={item.total.toFixed(2)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Item
            </Button>
          </CardContent>
        </Card>

        {/* Parcelas */}
        <Card>
          <CardHeader>
            <CardTitle>Parcelas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {installments.map((installment, index) => (
              <div
                key={`installment-${index}-${installment.number}`}
                className="grid grid-cols-12 gap-2 items-end"
              >
                <div className="col-span-2">
                  <Label>Número</Label>
                  <Input
                    value={installment.number}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="col-span-3">
                  <Label>Vencimento</Label>
                  <Input
                    type="date"
                    value={
                      new Date(installment.dueDate).toISOString().split("T")[0]
                    }
                    onChange={(e) =>
                      updateInstallment(
                        index,
                        "dueDate",
                        new Date(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="col-span-3">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={installment.amount}
                    onChange={(e) =>
                      updateInstallment(index, "amount", Number(e.target.value))
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-span-3">
                  <Label>Status</Label>
                  <Select
                    value={installment.status}
                    onValueChange={(value) =>
                      updateInstallment(index, "status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="PARTIAL">Parcial</SelectItem>
                      <SelectItem value="PAID">Pago</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInstallment(index)}
                    disabled={installments.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addInstallment}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Parcela
            </Button>
          </CardContent>
        </Card>

        {/* Total */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-lg font-semibold">Total Geral:</span>
              </div>
              <span className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(form.watch("totalNet"))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
