# Feature de Despesas

Esta feature implementa um sistema completo de gerenciamento de despesas com controle de parcelas, pagamentos, anexos e relatórios.

## Funcionalidades Implementadas

### 🏗️ Estrutura de Dados

- **Despesas**: Controle completo de despesas com fornecedores, categorias, itens e parcelas
- **Fornecedores**: Cadastro e gerenciamento de fornecedores
- **Categorias**: Sistema hierárquico de categorias de despesas
- **Contas**: Controle de contas bancárias e caixa
- **Parcelas**: Sistema de parcelamento com controle de vencimentos
- **Pagamentos**: Registro de pagamentos com diferentes métodos
- **Anexos**: Upload e gerenciamento de documentos

### 🔧 Server Actions

#### Despesas
- `getExpenses()` - Listar despesas com filtros e paginação
- `getExpenseById()` - Buscar despesa por ID com todas as relações
- `createExpense()` - Criar nova despesa com itens e parcelas
- `updateExpense()` - Atualizar despesa existente
- `deleteExpense()` - Excluir despesa (soft delete)
- `updateExpenseStatus()` - Atualizar status baseado nas parcelas
- `getExpenseStats()` - Calcular estatísticas de despesas

#### Parcelas
- `createInstallment()` - Criar nova parcela
- `updateInstallment()` - Atualizar parcela existente
- `deleteInstallment()` - Excluir parcela (se não houver pagamentos)
- `getOverdueInstallments()` - Listar parcelas vencidas
- `getUpcomingInstallments()` - Listar próximos vencimentos

#### Itens de Despesa
- `createExpenseItem()` - Criar novo item
- `updateExpenseItem()` - Atualizar item existente
- `deleteExpenseItem()` - Excluir item

#### Pagamentos
- `createPayment()` - Registrar pagamento de parcela
- `deletePayment()` - Excluir pagamento (soft delete)

#### Anexos
- `createAttachment()` - Adicionar anexo à despesa
- `deleteAttachment()` - Excluir anexo (soft delete)

### 📊 Queries e Hooks

#### Hooks de Consulta
- `useExpenses()` - Listar despesas
- `useExpense()` - Buscar despesa por ID
- `useExpenseStats()` - Estatísticas de despesas
- `useOverdueInstallments()` - Parcelas vencidas
- `useUpcomingInstallments()` - Próximos vencimentos

#### Hooks de Mutação
- `useCreateExpense()` - Criar despesa
- `useUpdateExpense()` - Atualizar despesa
- `useDeleteExpense()` - Excluir despesa
- `useCreatePayment()` - Registrar pagamento
- `useDeletePayment()` - Excluir pagamento
- `useCreateAttachment()` - Adicionar anexo
- `useDeleteAttachment()` - Excluir anexo
- `useUpdateExpenseStatus()` - Atualizar status
- `useCreateInstallment()` - Criar parcela
- `useUpdateInstallment()` - Atualizar parcela
- `useDeleteInstallment()` - Excluir parcela
- `useCreateExpenseItem()` - Criar item
- `useUpdateExpenseItem()` - Atualizar item
- `useDeleteExpenseItem()` - Excluir item

### 🛠️ Utilitários

#### Formatação
- `formatCurrency()` - Formatar valores monetários
- `formatDate()` - Formatar datas
- `formatDateTime()` - Formatar data e hora
- `formatFileSize()` - Formatar tamanho de arquivo

#### Cálculos
- `calculateInstallmentPaidAmount()` - Total pago de parcela
- `calculateInstallmentRemainingAmount()` - Valor restante de parcela
- `calculateInstallmentPaidPercentage()` - Percentual pago de parcela
- `calculateExpensePaidAmount()` - Total pago de despesa
- `calculateExpenseRemainingAmount()` - Valor restante de despesa
- `calculateExpensePaidPercentage()` - Percentual pago de despesa
- `calculateDaysOverdue()` - Dias de atraso
- `calculateDaysUntilDue()` - Dias até vencimento

#### Validações
- `validateExpenseAmounts()` - Validar consistência de valores
- `isInstallmentOverdue()` - Verificar se parcela está vencida
- `hasOverdueInstallments()` - Verificar se despesa tem parcelas vencidas

#### Status e Cores
- `getExpenseStatusText()` - Texto do status da despesa
- `getExpenseStatusColor()` - Cor do status da despesa
- `getInstallmentStatusText()` - Texto do status da parcela
- `getInstallmentStatusColor()` - Cor do status da parcela
- `getPaymentMethodText()` - Texto do método de pagamento

#### Arquivos
- `getFileExtension()` - Extensão do arquivo
- `isImageFile()` - Verificar se é imagem
- `isPdfFile()` - Verificar se é PDF
- `getFileIcon()` - Ícone baseado no tipo de arquivo

### 📋 Validações

#### Schemas Zod
- `createExpenseSchema` - Validação para criação de despesa
- `updateExpenseSchema` - Validação para atualização de despesa
- `expensePaymentSchema` - Validação para pagamentos
- `expenseAttachmentSchema` - Validação para anexos
- `expenseItemSchema` - Validação para itens
- `expenseInstallmentSchema` - Validação para parcelas
- `listExpensesSchema` - Validação para listagem
- `expenseStatsSchema` - Validação para estatísticas

### ⚙️ Configurações

#### Constantes
- Status de despesas e parcelas
- Métodos de pagamento
- Tipos de conta
- Opções de filtros e ordenação
- Limites de upload de arquivos
- Configurações de paginação
- Configurações de cache
- Mensagens de erro

## Estrutura de Arquivos

```
src/app/(main)/(feature-expenses)/
├── server/
│   ├── expenses.ts          # Server actions principais
│   ├── categories.ts        # Server actions de categorias
│   ├── vendors.ts          # Server actions de fornecedores
│   └── accounts.ts         # Server actions de contas
├── queries/
│   ├── expenses.ts         # Hooks React Query
│   ├── categories.ts       # Hooks de categorias
│   ├── vendors.ts         # Hooks de fornecedores
│   └── accounts.ts        # Hooks de contas
├── types/
│   ├── expenses.ts        # Tipos TypeScript
│   ├── categories.ts      # Tipos de categorias
│   ├── vendors.ts        # Tipos de fornecedores
│   └── accounts.ts       # Tipos de contas
├── validators/
│   ├── expenses.ts        # Schemas Zod
│   ├── categories.ts      # Validações de categorias
│   ├── vendors.ts        # Validações de fornecedores
│   └── accounts.ts       # Validações de contas
├── lib/
│   ├── expense-utils.ts   # Utilitários de despesas
│   └── constants.ts       # Constantes da feature
└── (pages)/
    └── expenses/
        └── _components/   # Componentes da interface
```

## Uso das Server Actions

### Exemplo de Criação de Despesa

```typescript
import { createExpense } from "@/app/(main)/(feature-expenses)/server/expenses";

const result = await createExpense({
  vendorId: "vendor-id",
  categoryId: "category-id",
  description: "Descrição da despesa",
  competenceDate: new Date(),
  totalNet: 1000.00,
  status: "DRAFT",
  items: [
    {
      name: "Item 1",
      quantity: 2,
      unitPrice: 500.00,
      discount: 0,
      total: 1000.00,
    },
  ],
  installments: [
    {
      number: 1,
      dueDate: new Date(),
      amount: 1000.00,
      status: "PENDING",
    },
  ],
});
```

### Exemplo de Registro de Pagamento

```typescript
import { createPayment } from "@/app/(main)/(feature-expenses)/server/expenses";

const result = await createPayment({
  installmentId: "installment-id",
  paidAt: new Date(),
  amount: 500.00,
  accountId: "account-id",
  paymentMethod: "PIX",
  note: "Pagamento parcial",
});
```

### Exemplo de Uso dos Hooks

```typescript
import { useExpenses, useCreateExpense } from "@/app/(main)/(feature-expenses)/queries/expenses";

function ExpenseList() {
  const { data: expenses, isLoading } = useExpenses(
    { search: "", status: "OPEN" },
    { page: 1, limit: 10 }
  );
  
  const createExpenseMutation = useCreateExpense();
  
  const handleCreate = async (data) => {
    await createExpenseMutation.mutateAsync(data);
  };
  
  // ... resto do componente
}
```

## Status de Despesas

- **DRAFT**: Rascunho - Despesa em criação
- **OPEN**: Aberto - Despesa aprovada, aguardando pagamento
- **PARTIALLY_PAID**: Parcial - Algumas parcelas foram pagas
- **PAID**: Pago - Todas as parcelas foram pagas
- **CANCELLED**: Cancelado - Despesa cancelada

## Status de Parcelas

- **PENDING**: Pendente - Aguardando pagamento
- **PARTIAL**: Parcial - Pagamento parcial realizado
- **PAID**: Pago - Parcela totalmente paga
- **CANCELLED**: Cancelado - Parcela cancelada

## Métodos de Pagamento

- PIX
- TED
- DOC
- Boleto
- Cartão de Crédito
- Cartão de Débito
- Dinheiro
- Cheque

## Próximos Passos

- [ ] Implementar relatórios avançados
- [ ] Adicionar exportação de dados
- [ ] Implementar notificações de vencimento
- [ ] Adicionar dashboard com gráficos
- [ ] Implementar aprovação de despesas
- [ ] Adicionar controle de orçamento
- [ ] Implementar integração com bancos
- [ ] Adicionar backup automático de anexos
