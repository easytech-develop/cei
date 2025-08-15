# Feature Financeira

Este módulo contém todas as funcionalidades relacionadas ao sistema financeiro da aplicação.

## Estrutura

```
(feature-financials)/
├── (pages)/
│   ├── contacts/           # Gestão de contatos (clientes/fornecedores)
│   └── cash-accounts/      # Gestão de contas bancárias
├── queries/                # Queries React Query
├── server/                 # Actions do servidor
├── types/                  # Tipos TypeScript
├── validators/             # Schemas de validação Zod
└── README.md              # Esta documentação
```

## Funcionalidades

### Contatos (`contacts/`)

Gerencia contatos, clientes e fornecedores do sistema.

**Componentes:**
- `ListContacts` - Lista todos os contatos com filtros e paginação
- `CreateContact` - Modal para criar novo contato
- `UpdateContact` - Modal para editar contato existente
- `DeleteContact` - Dialog de confirmação para excluir contato

**Funcionalidades:**
- CRUD completo de contatos
- Filtros por nome, documento, email e função
- Validação de documentos únicos
- Soft delete (exclusão lógica)
- Restauração automática de contatos deletados

### Contas Bancárias (`cash-accounts/`)

Gerencia contas bancárias e financeiras do sistema.

**Componentes:**
- `ListCashAccounts` - Lista todas as contas bancárias com filtros e paginação
- `CreateCashAccount` - Modal para criar nova conta bancária
- `UpdateCashAccount` - Modal para editar conta bancária existente
- `DeleteCashAccount` - Dialog de confirmação para excluir conta bancária

**Funcionalidades:**
- CRUD completo de contas bancárias
- Suporte a diferentes tipos de conta (Dinheiro, Conta Corrente, Poupança, Investimento, Outro)
- Filtros por nome, tipo, agência, número da conta e status
- Validação de conta contábil relacionada
- Saldo inicial configurável
- Status ativo/inativo
- Soft delete (exclusão lógica)

## Padrões de Desenvolvimento

### Estrutura de Arquivos

Cada funcionalidade segue a mesma estrutura:

1. **Types** (`types/`) - Definições de tipos TypeScript
2. **Validators** (`validators/`) - Schemas Zod para validação
3. **Server** (`server/`) - Actions do servidor (Server Actions)
4. **Queries** (`queries/`) - Hooks React Query para cache e sincronização
5. **Pages** (`(pages)/`) - Componentes da interface

### Validação

Todos os formulários usam Zod para validação com schemas específicos:
- `create*Schema` - Para criação
- `update*Schema` - Para atualização
- `*ResponseSchema` - Para respostas da API

### Tratamento de Erros

- Logs centralizados via `logError`
- Mensagens de erro amigáveis
- Toast notifications para feedback do usuário
- Validação tanto no cliente quanto no servidor

### Cache e Sincronização

- React Query para cache e sincronização automática
- Invalidação de cache após operações de escrita
- Stale time configurado para 5 minutos

### Soft Delete

Todas as entidades implementam soft delete:
- Campo `deletedAt` para marcar exclusão
- Filtros automáticos para excluir registros deletados
- Possibilidade de restauração

## Uso

### Exemplo de uso dos componentes:

```tsx
import { CreateCashAccount, ListCashAccounts } from "./_components";

export default function CashAccountsPage() {
  return (
    <div>
      <CreateCashAccount trigger={<Button>Criar Conta</Button>} />
      <ListCashAccounts />
    </div>
  );
}
```

### Exemplo de uso das queries:

```tsx
import { useGetCashAccounts } from "../queries/cash-accounts";

function MyComponent() {
  const { data, isLoading } = useGetCashAccounts({
    meta: { page: 1, limit: 10 },
    filters: { isActive: true }
  });
  
  // ...
}
```

## Próximos Passos

- [ ] Implementar permissões específicas para cada funcionalidade
- [ ] Adicionar auditoria de mudanças
- [ ] Implementar exportação de dados
- [ ] Adicionar relatórios financeiros
- [ ] Implementar integração com APIs bancárias
