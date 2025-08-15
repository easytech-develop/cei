# Feature Financeira

Este módulo contém todas as funcionalidades relacionadas ao controle financeiro da aplicação.

## Funcionalidades

### Contatos
- CRUD completo de contatos (clientes e fornecedores)
- Validação de documentos únicos
- Filtros por nome, documento, email e funções
- Paginação

### Contas Bancárias
- CRUD completo de contas bancárias
- Diferentes tipos de conta (dinheiro, corrente, poupança, investimento)
- Validação de saldo inicial

### Documentos
- CRUD completo de documentos financeiros
- Suporte a documentos a receber (IN) e a pagar (OUT)
- Filtros avançados por:
  - Busca textual (número, descrição, contato, categoria)
  - Direção (a receber/a pagar)
  - Status (aberto, parcialmente pago, pago, cancelado)
  - Contato específico
  - Categoria
  - Centro de custo
  - Período de emissão
  - Período de vencimento
  - Faixa de valores
- Paginação com ordenação por vencimento
- Relacionamentos com contatos, categorias, centros de custo e regras de cobrança

## Estrutura de Arquivos

```
(feature-financials)/
├── (pages)/
│   ├── cash-accounts/          # Páginas de contas bancárias
│   ├── contacts/              # Páginas de contatos
│   └── wallet/                # Páginas de documentos
├── queries/                   # Hooks do React Query
│   ├── cash-accounts.ts
│   ├── contacts.ts
│   └── documents.ts
├── server/                    # Server Actions
│   ├── cash-accounts.ts
│   ├── contacts.ts
│   └── documents.ts
├── types/                     # Tipos TypeScript
│   ├── cash-accounts.ts
│   ├── contacts.ts
│   └── documents.ts
├── validators/                # Schemas de validação Zod
│   ├── cash-accounts.ts
│   ├── contacts.ts
│   └── documents.ts
└── ui/                        # Componentes específicos da feature
```

## Como Usar

### Documentos

#### Server Actions

```typescript
import { getDocuments, getDocumentById } from "./server/documents";

// Listar documentos com filtros e paginação
const result = await getDocuments({
  meta: { page: 1, limit: 10 },
  filters: {
    search: "nota fiscal",
    direction: ["IN"],
    status: ["OPEN"],
    dateFrom: new Date("2024-01-01"),
    dateTo: new Date("2024-12-31"),
    amountMin: 100,
    amountMax: 1000,
  },
});

// Buscar documento por ID
const document = await getDocumentById("document-id");
```

#### React Query Hooks

```typescript
import { useDocuments, useDocument } from "./queries/documents";

function DocumentList() {
  const { data, isLoading, error } = useDocuments(
    { page: 1, limit: 10 },
    { direction: ["IN"], status: ["OPEN"] }
  );

  const { data: document } = useDocument("document-id");

  // Renderizar dados...
}
```

#### Filtros Disponíveis

- `search`: Busca textual em número, descrição, contato, categoria
- `direction`: Array de direções ("IN" | "OUT")
- `status`: Array de status ("OPEN" | "PARTIALLY_PAID" | "PAID" | "CANCELLED")
- `contactId`: ID do contato específico
- `categoryId`: ID da categoria específica
- `costCenterId`: ID do centro de custo específico
- `dateFrom`/`dateTo`: Período de emissão
- `dueDateFrom`/`dueDateTo`: Período de vencimento
- `amountMin`/`amountMax`: Faixa de valores

#### Exemplo de Componente

```typescript
import { useState } from "react";
import { useDocuments } from "../queries/documents";

export function DocumentList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useDocuments(
    { page, limit: 10 },
    filters
  );

  return (
    <div>
      {/* Filtros */}
      <input
        placeholder="Buscar..."
        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
      />

      {/* Lista */}
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        data?.data?.documents.map(document => (
          <div key={document.id}>
            {document.documentNumber} - {document.contact.name}
          </div>
        ))
      )}

      {/* Paginação */}
      {data?.data?.meta.totalPages > 1 && (
        <div>
          Página {page} de {data.data.meta.totalPages}
        </div>
      )}
    </div>
  );
}
```

## Validações

Todos os dados são validados usando Zod schemas antes de serem processados:

- Validação de campos obrigatórios
- Validação de tipos de dados
- Validação de unicidade de documentos
- Validação de relacionamentos existentes

## Tratamento de Erros

Todas as actions retornam um objeto padronizado:

```typescript
type ActionResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};
```

## Performance

- Consultas otimizadas com índices no banco de dados
- Paginação para grandes volumes de dados
- Cache com React Query (5 minutos de stale time)
- Consultas em paralelo quando possível
