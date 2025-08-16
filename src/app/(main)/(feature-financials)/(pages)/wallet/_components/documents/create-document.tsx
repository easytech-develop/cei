"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { DocumentDirection } from "@prisma/client";
import {
  ArrowRight,
  Building2,
  Calculator,
  Calendar,
  Check,
  ChevronDownIcon,
  CreditCard,
  DollarSign,
  FileText,
  Info,
  Tag,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useGetCategories } from "@/app/(main)/(feature-financials)/queries/categories";
import {
  useGetCustomers,
  useGetSuppliers,
} from "@/app/(main)/(feature-financials)/queries/contacts";
import { useGetCostCenters } from "@/app/(main)/(feature-financials)/queries/cost-centers";
import { documentsKeys } from "@/app/(main)/(feature-financials)/queries/documents";
import { createDocument } from "@/app/(main)/(feature-financials)/server/documents";
import {
  type CreateDocumentSchema,
  createDocumentSchema,
} from "@/app/(main)/(feature-financials)/validators/documents";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queries/query-client";
import { cn, formatCurrency, mask, parseCurrencyToDecimal } from "@/lib/utils";

type CreateDocumentProps = {
  trigger: React.ReactNode;
  onSuccess?: () => void;
};

const directionOptions = [
  {
    value: "IN",
    label: "Entrada",
    description: "A Receber",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    value: "OUT",
    label: "Saída",
    description: "A Pagar",
    icon: CreditCard,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

type Installment = {
  number: number;
  amount: number;
  dueAt: Date;
};

export default function CreateDocument({
  trigger,
  onSuccess,
}: CreateDocumentProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [installmentCount, setInstallmentCount] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<CreateDocumentSchema>({
    defaultValues: {
      direction: "OUT",
      contactId: "",
      categoryId: "",
      costCenterId: "",
      totalAmount: "",
      issueAt: new Date(),
      dueAt: new Date(),
      competenceAt: new Date(),
      status: "OPEN",
      description: "",
      isInstallment: false,
    },
    resolver: zodResolver(createDocumentSchema),
  });

  const direction = form.watch("direction");
  const totalAmount = form.watch("totalAmount");
  const dueAt = form.watch("dueAt");
  const competenceAt = form.watch("competenceAt");
  const isInstallment = form.watch("isInstallment");
  const contactId = form.watch("contactId");
  const categoryId = form.watch("categoryId");

  // Queries
  const { data: customersData } = useGetCustomers();
  const { data: suppliersData } = useGetSuppliers();
  const { data: categoriesData } = useGetCategories({
    meta: {
      page: 1,
      limit: 100,
    },
  });
  const { data: costCentersData } = useGetCostCenters();

  const contacts =
    direction === "IN" ? customersData?.contacts : suppliersData?.contacts;
  const categories = categoriesData?.data?.categories;

  // Calcular parcelas quando necessário
  useEffect(() => {
    const totalAmountDecimal = Number(parseCurrencyToDecimal(totalAmount));
    if (isInstallment && totalAmountDecimal > 0 && installmentCount > 0) {
      const installmentAmount = totalAmountDecimal / installmentCount;
      const newInstallments: Installment[] = [];

      for (let i = 1; i <= installmentCount; i++) {
        const installmentDate = new Date(dueAt);
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

        newInstallments.push({
          number: i,
          amount:
            i === installmentCount
              ? totalAmountDecimal - installmentAmount * (i - 1)
              : installmentAmount,
          dueAt: installmentDate,
        });
      }

      setInstallments(newInstallments);
      form.setValue("installments", newInstallments);
    } else {
      setInstallments([]);
      form.setValue("installments", []);
    }
  }, [isInstallment, totalAmount, installmentCount, dueAt, form]);

  async function onSubmit(data: CreateDocumentSchema) {
    setIsSubmitting(true);

    try {
      const response = await createDocument(data);
      if (response.success && response.data?.document) {
        queryClient.invalidateQueries({ queryKey: documentsKeys.all });
        onSuccess?.();
        toast.success(response.message);
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Erro ao criar documento");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleChangeDirection(value: string) {
    form.setValue("direction", value as DocumentDirection);
    form.setValue("contactId", "");
    form.setValue("categoryId", "");
    setCurrentStep(1);
  }

  useEffect(() => {
    if (open) {
      form.reset({
        direction: "OUT",
        contactId: "",
        categoryId: "",
        costCenterId: "",
        totalAmount: "",
        issueAt: new Date(),
        dueAt: new Date(),
        competenceAt: new Date(),
        status: "OPEN",
        description: "",
        isInstallment: false,
      });
      setInstallments([]);
      setInstallmentCount(1);
      setCurrentStep(1);
    }
  }, [open, form]);

  const selectedContact = contacts?.find((contact) => contact.id === contactId);
  const selectedCategory = categories?.find(
    (category) => category.id === categoryId,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold">
                Criar Documento
              </DialogTitle>
              <DialogDescription className="text-base">
                Adicione um novo documento financeiro ao sistema
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Direção e Informações Básicas */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Direção */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowRight className="h-5 w-5" />
                      Tipo de Documento
                    </CardTitle>
                    <CardDescription>
                      Selecione se é uma entrada (a receber) ou saída (a pagar)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {directionOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = direction === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleChangeDirection(option.value)}
                            className={cn(
                              "relative p-6 rounded-xl border-2 transition-all duration-200 text-left",
                              isSelected
                                ? `${option.borderColor} ${option.bgColor} shadow-md`
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={cn(
                                  "p-2 rounded-lg",
                                  isSelected ? option.bgColor : "bg-gray-100",
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "h-6 w-6",
                                    isSelected ? option.color : "text-gray-600",
                                  )}
                                />
                              </div>
                              <div className="flex-1">
                                <h3
                                  className={cn(
                                    "font-semibold text-lg",
                                    isSelected ? option.color : "text-gray-900",
                                  )}
                                >
                                  {option.label}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {option.description}
                                </p>
                              </div>
                              {isSelected && (
                                <Check
                                  className={cn("h-5 w-5", option.color)}
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Contato e Categoria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contato */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Contato
                      </CardTitle>
                      <CardDescription>
                        {direction === "IN" ? "Cliente" : "Fornecedor"}{" "}
                        responsável
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="contactId"
                        render={({ field }) => (
                          <FormItem>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <button
                                    type="button"
                                    className={cn(
                                      "w-full flex items-center justify-between p-3 text-left border rounded-lg transition-colors",
                                      field.value
                                        ? "border-primary bg-primary/5"
                                        : "border-gray-200 hover:border-gray-300",
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <User className="h-4 w-4 text-gray-500" />
                                      <span
                                        className={
                                          field.value
                                            ? "text-primary font-medium"
                                            : "text-gray-500"
                                        }
                                      >
                                        {selectedContact?.name ||
                                          `Selecione ${direction === "IN" ? "cliente" : "fornecedor"}`}
                                      </span>
                                    </div>
                                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                  </button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-full p-0"
                                align="start"
                              >
                                <Command>
                                  <CommandInput
                                    placeholder={`Buscar ${direction === "IN" ? "cliente" : "fornecedor"}...`}
                                  />
                                  <CommandList>
                                    <CommandGroup>
                                      {contacts?.map((contact) => (
                                        <CommandItem
                                          key={contact.id}
                                          onSelect={() =>
                                            field.onChange(contact.id)
                                          }
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {contact.name}
                                            </span>
                                            {contact.document && (
                                              <span className="text-xs text-muted-foreground">
                                                {contact.document}
                                              </span>
                                            )}
                                          </div>
                                          <Check
                                            className={cn(
                                              "h-4 w-4",
                                              field.value === contact.id
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
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
                    </CardContent>
                  </Card>

                  {/* Categoria */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Categoria
                      </CardTitle>
                      <CardDescription>
                        Classificação do documento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <button
                                    type="button"
                                    className={cn(
                                      "w-full flex items-center justify-between p-3 text-left border rounded-lg transition-colors",
                                      field.value
                                        ? "border-primary bg-primary/5"
                                        : "border-gray-200 hover:border-gray-300",
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Tag className="h-4 w-4 text-gray-500" />
                                      <span
                                        className={
                                          field.value
                                            ? "text-primary font-medium"
                                            : "text-gray-500"
                                        }
                                      >
                                        {selectedCategory?.name ||
                                          "Selecione categoria"}
                                      </span>
                                    </div>
                                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                  </button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-full p-0"
                                align="start"
                              >
                                <Command>
                                  <CommandInput placeholder="Buscar categoria..." />
                                  <CommandList>
                                    <CommandGroup>
                                      {categories?.map((category) => (
                                        <CommandItem
                                          key={category.id}
                                          onSelect={() =>
                                            field.onChange(category.id)
                                          }
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {category.name}
                                            </span>
                                            {category.description && (
                                              <span className="text-xs text-muted-foreground">
                                                {category.description}
                                              </span>
                                            )}
                                          </div>
                                          <Check
                                            className={cn(
                                              "h-4 w-4",
                                              field.value === category.id
                                                ? "opacity-100"
                                                : "opacity-0",
                                            )}
                                          />
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
                    </CardContent>
                  </Card>
                </div>

                {/* Validação do Step 1 */}
                {contactId && categoryId && (
                  <Alert className="border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Informações básicas preenchidas. Clique em "Continuar"
                      para prosseguir.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!contactId || !categoryId}
                    className="px-8"
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Valores e Datas */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Descrição */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Descrição
                    </CardTitle>
                    <CardDescription>
                      Informações adicionais sobre o documento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o que é este documento (opcional)"
                              {...field}
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Valor e Centro de Custo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Valor Total */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Valor Total
                      </CardTitle>
                      <CardDescription>
                        Valor principal do documento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                  {...field}
                                  placeholder="0,00"
                                  value={field.value || ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      mask.currency(e.target.value),
                                    )
                                  }
                                  className="pl-10 text-lg font-semibold"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Centro de Custo */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Centro de Custo
                      </CardTitle>
                      <CardDescription>
                        Centro de custo (opcional)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="costCenterId"
                        render={({ field }) => (
                          <FormItem>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <button
                                    type="button"
                                    className={cn(
                                      "w-full flex items-center justify-between p-3 text-left border rounded-lg transition-colors",
                                      field.value
                                        ? "border-primary bg-primary/5"
                                        : "border-gray-200 hover:border-gray-300",
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Building2 className="h-4 w-4 text-gray-500" />
                                      <span
                                        className={
                                          field.value
                                            ? "text-primary font-medium"
                                            : "text-gray-500"
                                        }
                                      >
                                        {costCentersData?.costCenters?.find(
                                          (cc) => cc.id === field.value,
                                        )?.name || "Selecione centro de custo"}
                                      </span>
                                    </div>
                                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                  </button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-full p-0"
                                align="start"
                              >
                                <Command>
                                  <CommandInput placeholder="Buscar centro de custo..." />
                                  <CommandList>
                                    <CommandGroup>
                                      {costCentersData?.costCenters?.map(
                                        (costCenter) => (
                                          <CommandItem
                                            key={costCenter.id}
                                            onSelect={() =>
                                              field.onChange(costCenter.id)
                                            }
                                          >
                                            <div className="flex flex-col">
                                              <span className="font-medium">
                                                {costCenter.name}
                                              </span>
                                              {costCenter.code && (
                                                <span className="text-xs text-muted-foreground">
                                                  {costCenter.code}
                                                </span>
                                              )}
                                            </div>
                                            <Check
                                              className={cn(
                                                "h-4 w-4",
                                                field.value === costCenter.id
                                                  ? "opacity-100"
                                                  : "opacity-0",
                                              )}
                                            />
                                          </CommandItem>
                                        ),
                                      )}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Datas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Datas Importantes
                    </CardTitle>
                    <CardDescription>
                      Configure as datas de vencimento e competência
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Data de Vencimento */}
                      <FormField
                        control={form.control}
                        name="dueAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Data de Vencimento *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                value={
                                  field.value
                                    ? new Date(field.value)
                                      .toISOString()
                                      .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value))
                                }
                                className="p-3"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Data de Competência */}
                      <FormField
                        control={form.control}
                        name="competenceAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              Data de Competência *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                value={
                                  field.value
                                    ? new Date(field.value)
                                      .toISOString()
                                      .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value))
                                }
                                className="p-3"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Parcelado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Configuração de Parcelas
                    </CardTitle>
                    <CardDescription>
                      Defina se o documento será parcelado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="isInstallment"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                <span className="font-medium">
                                  Documento Parcelado
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Dividir em múltiplas parcelas
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Configuração de Parcelas */}
                    {isInstallment && (
                      <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <Info className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Configuração de Parcelas
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="installment-count"
                              className="text-sm font-medium mb-2 block"
                            >
                              Número de Parcelas
                            </label>
                            <Input
                              id="installment-count"
                              type="number"
                              min="1"
                              max="60"
                              value={installmentCount}
                              onChange={(e) =>
                                setInstallmentCount(
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="p-3"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="installment-value"
                              className="text-sm font-medium mb-2 block"
                            >
                              Valor por Parcela
                            </label>
                            <div className="p-3 bg-white border rounded-md text-lg font-semibold text-green-600">
                              {Number(parseCurrencyToDecimal(totalAmount)) >
                                0 && installmentCount > 0
                                ? formatCurrency(
                                  Number(
                                    parseCurrencyToDecimal(totalAmount),
                                  ) / installmentCount,
                                )
                                : "R$ 0,00"}
                            </div>
                          </div>
                        </div>

                        {/* Lista de Parcelas */}
                        {installments.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">
                              Parcelas Calculadas
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {installments.map((installment) => (
                                <div
                                  key={installment.number}
                                  className="flex items-center justify-between p-3 bg-white border rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <Badge variant="secondary">
                                      Parcela {installment.number}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                      {new Date(
                                        installment.dueAt,
                                      ).toLocaleDateString("pt-BR")}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(installment.amount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={!totalAmount || !dueAt || !competenceAt}
                    className="px-8"
                  >
                    {isSubmitting ? "Criando..." : "Criar Documento"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
