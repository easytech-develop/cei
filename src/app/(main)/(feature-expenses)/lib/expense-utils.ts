import type { ExpenseWithRelations, ExpenseInstallmentWithPayments } from "../types/expenses";

// Formatação de valores monetários
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Formatação de datas
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(dateObj);
}

// Formatação de data e hora
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

// Cálculo do total pago de uma parcela
export function calculateInstallmentPaidAmount(installment: ExpenseInstallmentWithPayments): number {
  return installment.Payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
}

// Cálculo do valor restante de uma parcela
export function calculateInstallmentRemainingAmount(installment: ExpenseInstallmentWithPayments): number {
  const paidAmount = calculateInstallmentPaidAmount(installment);
  return Number(installment.amount) - paidAmount;
}

// Cálculo do percentual pago de uma parcela
export function calculateInstallmentPaidPercentage(installment: ExpenseInstallmentWithPayments): number {
  const paidAmount = calculateInstallmentPaidAmount(installment);
  const totalAmount = Number(installment.amount);
  return totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
}

// Cálculo do total pago de uma despesa
export function calculateExpensePaidAmount(expense: ExpenseWithRelations): number {
  return expense.Installments.reduce((sum, installment) => {
    return sum + calculateInstallmentPaidAmount(installment);
  }, 0);
}

// Cálculo do valor restante de uma despesa
export function calculateExpenseRemainingAmount(expense: ExpenseWithRelations): number {
  const paidAmount = calculateExpensePaidAmount(expense);
  return Number(expense.totalNet) - paidAmount;
}

// Cálculo do percentual pago de uma despesa
export function calculateExpensePaidPercentage(expense: ExpenseWithRelations): number {
  const paidAmount = calculateExpensePaidAmount(expense);
  const totalAmount = Number(expense.totalNet);
  return totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
}

// Verificar se uma parcela está vencida
export function isInstallmentOverdue(installment: ExpenseInstallmentWithPayments): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(installment.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today && installment.status !== "PAID";
}

// Calcular dias de atraso de uma parcela
export function calculateDaysOverdue(installment: ExpenseInstallmentWithPayments): number {
  if (!isInstallmentOverdue(installment)) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(installment.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - dueDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Calcular dias até o vencimento
export function calculateDaysUntilDue(installment: ExpenseInstallmentWithPayments): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(installment.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Obter cor baseada no status da parcela
export function getInstallmentStatusColor(status: string): string {
  switch (status) {
    case "PAID":
      return "text-green-600 bg-green-100";
    case "PARTIAL":
      return "text-yellow-600 bg-yellow-100";
    case "PENDING":
      return "text-blue-600 bg-blue-100";
    case "CANCELLED":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

// Obter cor baseada no status da despesa
export function getExpenseStatusColor(status: string): string {
  switch (status) {
    case "PAID":
      return "text-green-600 bg-green-100";
    case "PARTIALLY_PAID":
      return "text-yellow-600 bg-yellow-100";
    case "OPEN":
      return "text-blue-600 bg-blue-100";
    case "DRAFT":
      return "text-gray-600 bg-gray-100";
    case "CANCELLED":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

// Obter texto do status da parcela
export function getInstallmentStatusText(status: string): string {
  switch (status) {
    case "PAID":
      return "Pago";
    case "PARTIAL":
      return "Parcial";
    case "PENDING":
      return "Pendente";
    case "CANCELLED":
      return "Cancelado";
    default:
      return "Desconhecido";
  }
}

// Obter texto do status da despesa
export function getExpenseStatusText(status: string): string {
  switch (status) {
    case "PAID":
      return "Pago";
    case "PARTIALLY_PAID":
      return "Parcial";
    case "OPEN":
      return "Aberto";
    case "DRAFT":
      return "Rascunho";
    case "CANCELLED":
      return "Cancelado";
    default:
      return "Desconhecido";
  }
}

// Obter texto do método de pagamento
export function getPaymentMethodText(method: string): string {
  switch (method) {
    case "PIX":
      return "PIX";
    case "TED":
      return "TED";
    case "DOC":
      return "DOC";
    case "BOLETO":
      return "Boleto";
    case "CARTAO_CREDITO":
      return "Cartão de Crédito";
    case "CARTAO_DEBITO":
      return "Cartão de Débito";
    case "DINHEIRO":
      return "Dinheiro";
    case "CHEQUE":
      return "Cheque";
    default:
      return "Desconhecido";
  }
}

// Calcular total de itens de uma despesa
export function calculateExpenseItemsTotal(expense: ExpenseWithRelations): number {
  return expense.Items.reduce((sum, item) => sum + Number(item.total), 0);
}

// Calcular total de desconto dos itens
export function calculateExpenseItemsDiscount(expense: ExpenseWithRelations): number {
  return expense.Items.reduce((sum, item) => sum + Number(item.discount), 0);
}

// Verificar se uma despesa tem anexos
export function hasAttachments(expense: ExpenseWithRelations): boolean {
  return expense.Attachments.length > 0;
}

// Verificar se uma despesa tem parcelas vencidas
export function hasOverdueInstallments(expense: ExpenseWithRelations): boolean {
  return expense.Installments.some(installment => isInstallmentOverdue(installment));
}

// Obter parcelas vencidas de uma despesa
export function getOverdueInstallments(expense: ExpenseWithRelations): ExpenseInstallmentWithPayments[] {
  return expense.Installments.filter(installment => isInstallmentOverdue(installment));
}

// Obter parcelas pendentes de uma despesa
export function getPendingInstallments(expense: ExpenseWithRelations): ExpenseInstallmentWithPayments[] {
  return expense.Installments.filter(installment => installment.status === "PENDING");
}

// Obter parcelas pagas de uma despesa
export function getPaidInstallments(expense: ExpenseWithRelations): ExpenseInstallmentWithPayments[] {
  return expense.Installments.filter(installment => installment.status === "PAID");
}

// Calcular valor total das parcelas
export function calculateInstallmentsTotal(expense: ExpenseWithRelations): number {
  return expense.Installments.reduce((sum, installment) => sum + Number(installment.amount), 0);
}

// Verificar se os valores da despesa estão consistentes
export function validateExpenseAmounts(expense: ExpenseWithRelations): {
  isValid: boolean;
  itemsTotal: number;
  installmentsTotal: number;
  expenseTotal: number;
  differences: string[];
} {
  const itemsTotal = calculateExpenseItemsTotal(expense);
  const installmentsTotal = calculateInstallmentsTotal(expense);
  const expenseTotal = Number(expense.totalNet);
  
  const differences: string[] = [];
  
  if (Math.abs(itemsTotal - expenseTotal) > 0.01) {
    differences.push(`Total dos itens (${formatCurrency(itemsTotal)}) não confere com total da despesa (${formatCurrency(expenseTotal)})`);
  }
  
  if (Math.abs(installmentsTotal - expenseTotal) > 0.01) {
    differences.push(`Total das parcelas (${formatCurrency(installmentsTotal)}) não confere com total da despesa (${formatCurrency(expenseTotal)})`);
  }
  
  return {
    isValid: differences.length === 0,
    itemsTotal,
    installmentsTotal,
    expenseTotal,
    differences,
  };
}

// Formatar tamanho de arquivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Obter extensão do arquivo
export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

// Verificar se é um arquivo de imagem
export function isImageFile(fileName: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
  const extension = getFileExtension(fileName);
  return imageExtensions.includes(extension);
}

// Verificar se é um arquivo PDF
export function isPdfFile(fileName: string): boolean {
  return getFileExtension(fileName) === "pdf";
}

// Obter ícone baseado no tipo de arquivo
export function getFileIcon(fileName: string): string {
  if (isImageFile(fileName)) return "🖼️";
  if (isPdfFile(fileName)) return "📄";
  
  const extension = getFileExtension(fileName);
  switch (extension) {
    case "doc":
    case "docx":
      return "📝";
    case "xls":
    case "xlsx":
      return "📊";
    case "txt":
      return "📄";
    default:
      return "📎";
  }
}
