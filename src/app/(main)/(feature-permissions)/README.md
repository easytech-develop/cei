# Feature de Permissões

Esta documentação descreve a feature de gerenciamento de permissões do sistema, incluindo permissões e sua integração com funções e usuários.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tabelas do Schema](#tabelas-do-schema)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Funcionalidades](#funcionalidades)
- [APIs](#apis)
- [Componentes](#componentes)
- [Validações](#validações)
- [Integração com Roles e Users](#integração-com-roles-e-users)

## 🎯 Visão Geral

A feature de permissões permite o gerenciamento completo de permissões do sistema, incluindo:

- **CRUD de Permissões**: Criar, listar, atualizar e excluir permissões
- **Gerenciamento de Permissões de Funções**: Associar permissões a funções específicos
- **Gerenciamento de Permissões de Usuários**: Configurar permissões individuais de usuários (GRANT/DENY)
- **Sistema de Códigos Únicos**: Cada permissão tem um código único no formato `recurso:ação`
- **Interface Avançada**: Interface moderna com agrupamento por recurso e busca
- **Validações**: Validação de dados e regras de negócio
- **Integração Completa**: Integração com as features de usuários e funções

## 🗄️ Tabelas do Schema

### Permission
Tabela principal de permissões do sistema.

```prisma
model Permission {
  id          String   @id @default(uuid(7))
  name        String   @unique // "Create Expense"
  description String?
  resource    String // "expense", "vendor", "student", "classroom"...
  action      String // "read","create","update","delete","approve","pay"...
  code        String   @unique // resource:action
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  RolePermission RolePermission[]
  UserPermission UserPermission[]
}
```

**Campos:**
- `id`: Identificador único da permissão (UUID v7)
- `name`: Nome descritivo da permissão (único)
- `description`: Descrição opcional da permissão
- `resource`: Recurso ao qual a permissão se aplica
- `action`: Ação que pode ser executada no recurso
- `code`: Código único da permissão (formato: `recurso:ação`)
- `createdAt`: Data de criação
- `updatedAt`: Data da última atualização

### RolePermission
Tabela de relacionamento entre funções e permissões (N:N).

```prisma
model RolePermission {
  roleId       String
  permissionId String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  Role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  Permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}
```

**Campos:**
- `roleId`: ID do função
- `permissionId`: ID da permissão
- `createdAt`: Data de criação da associação
- `updatedAt`: Data da última atualização

### UserPermission
Tabela de relacionamento entre usuários e permissões com modo (GRANT/DENY).

```prisma
model UserPermission {
  userId       String
  permissionId String
  mode         String // "GRANT" | "DENY"  (override final)
  scopeJson    Json?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  User       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  Permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([userId, permissionId])
}
```

**Campos:**
- `userId`: ID do usuário
- `permissionId`: ID da permissão
- `mode`: Modo da permissão (GRANT = conceder, DENY = negar)
- `scopeJson`: Escopo opcional da permissão (JSON)
- `createdAt`: Data de criação
- `updatedAt`: Data da última atualização
- `deletedAt`: Data de exclusão (soft delete)

## 📁 Estrutura de Arquivos

```
src/app/(main)/(feature-permissions)/
├── README.md                    # Esta documentação
├── (pages)/permissions/         # Página principal de permissões
│   ├── page.tsx                # Página de listagem
│   └── _components/            # Componentes da interface
│       ├── create-permission.tsx     # Modal de criação
│       ├── delete-permission.tsx     # Modal de exclusão
│       ├── list-permissions.tsx      # Tabela de permissões
│       ├── update-permission.tsx     # Modal de edição
│       ├── manage-role-permissions.tsx    # Gerenciar permissões de função
│       └── manage-user-permissions.tsx    # Gerenciar permissões de usuário
├── types/
│   └── permissions.ts          # Tipos TypeScript
├── queries/
│   └── permissions.ts          # Hooks React Query
├── server/
│   └── permissions.ts          # Funções server-side
└── validators/
    └── permissions.ts          # Schemas de validação Zod
```

## ⚙️ Funcionalidades

### 1. Listagem de Permissões
- **Paginação**: Suporte a paginação com limite configurável
- **Busca**: Busca por nome, descrição, recurso e ação
- **Filtros**: Filtros específicos por recurso e ação
- **Ordenação**: Ordenação por data de criação e nome
- **Exibição**: Mostra código único, recurso, ação e descrição

### 2. Criação de Permissão
- **Validações**: Validação de campos obrigatórios
- **Código Único**: Geração automática do código no formato `recurso:ação`
- **Verificação de Duplicação**: Verificação de código duplicado
- **Campos Opcionais**: Descrição opcional

### 3. Atualização de Permissão
- **Validações**: Validação de dados de entrada
- **Código Único**: Verificação de código duplicado (exceto próprio)
- **Transação**: Atualização atômica
- **Auditoria**: Registro de alterações

### 4. Exclusão de Permissão
- **Soft Delete**: Exclusão lógica (marca deletedAt)
- **Validação**: Verifica se permissão existe e não está deletada
- **Proteção**: Impede exclusão se há funções ou usuários associados
- **Auditoria**: Registro da exclusão

### 5. Gerenciamento de Permissões de Funções
- **Interface Avançada**: Modal com agrupamento por recurso
- **Busca em Tempo Real**: Busca por nome, descrição, recurso e ação
- **Seleção Múltipla**: Checkboxes para seleção de permissões
- **Controles Rápidos**: Botões para selecionar/limpar todas
- **Resumo Visual**: Contador de permissões selecionadas
- **Transação**: Atualização atômica de todas as permissões

### 6. Gerenciamento de Permissões de Usuários
- **Modo GRANT/DENY**: Permissões podem ser concedidas ou negadas
- **Sobrescrita**: Permissões de usuário sobrescrevem as de funções
- **Interface Dual**: Checkboxes separados para conceder e negar
- **Busca Avançada**: Busca por nome, descrição, recurso e ação
- **Controles Rápidos**: Botões para conceder/negar todas
- **Resumo Detalhado**: Contadores de permissões concedidas e negadas
- **Transação**: Atualização atômica de todas as permissões

## 🔌 APIs

### getPermissions
Lista permissões com paginação e filtros.

```typescript
getPermissions({
  meta: { page: 1, limit: 10 },
  filters?: {
    search?: string;
    resource?: string;
    action?: string;
  }
})
```

**Retorna:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    permissions: Permission[];
    meta: Meta;
  };
}
```

### createPermission
Cria uma nova permissão.

```typescript
createPermission({
  name: string;
  description?: string;
  resource: string;
  action: string;
})
```

### updatePermission
Atualiza uma permissão existente.

```typescript
updatePermission({
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
})
```

### deletePermission
Exclui uma permissão (apenas se não houver funções ou usuários associados).

```typescript
deletePermission(id: string)
```

### getRolePermissions
Obtém permissões de um função específico.

```typescript
getRolePermissions(roleId: string)
```

**Retorna:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    permissions: Permission[];
    assignedPermissionIds: string[];
  };
}
```

### updateRolePermissions
Atualiza permissões de um função.

```typescript
updateRolePermissions({
  roleId: string;
  permissionIds: string[];
})
```

### getUserPermissions
Obtém permissões de um usuário específico.

```typescript
getUserPermissions(userId: string)
```

**Retorna:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    permissions: Permission[];
    userPermissions: Array<{
      permissionId: string;
      mode: string;
      scopeJson: any;
    }>;
  };
}
```

### updateUserPermissions
Atualiza permissões de um usuário.

```typescript
updateUserPermissions({
  userId: string;
  permissions: Array<{
    permissionId: string;
    mode: "GRANT" | "DENY";
    scopeJson?: any;
  }>;
})
```

## 🧩 Componentes

### ListPermissions
Tabela responsiva com listagem de permissões.

**Funcionalidades:**
- Paginação automática
- Busca em tempo real
- Filtros por recurso e ação
- Ações de edição e exclusão
- Persistência de estado no localStorage
- Exibição de código único, recurso, ação e descrição

### CreatePermission
Modal para criação de permissões.

**Campos:**
- Nome (obrigatório, único)
- Descrição (opcional)
- Recurso (obrigatório)
- Ação (obrigatório)
- Código gerado automaticamente

### UpdatePermission
Modal para edição de permissões.

**Campos:**
- Nome (obrigatório, único)
- Descrição (opcional)
- Recurso (obrigatório)
- Ação (obrigatório)
- Código atualizado automaticamente

### DeletePermission
Modal de confirmação para exclusão.

**Funcionalidades:**
- Confirmação antes da exclusão
- Verificação de dependências
- Feedback visual

### ManageRolePermissions
Modal avançado para gerenciar permissões de funções.

**Funcionalidades:**
- Interface com agrupamento por recurso
- Busca em tempo real
- Seleção múltipla com checkboxes
- Controles para selecionar/limpar todas
- Resumo visual de seleções
- Transação atômica

### ManageUserPermissions
Modal avançado para gerenciar permissões de usuários.

**Funcionalidades:**
- Interface dual (GRANT/DENY)
- Agrupamento por recurso
- Busca em tempo real
- Checkboxes separados para conceder e negar
- Controles para conceder/negar todas
- Resumo detalhado de permissões
- Transação atômica

## ✅ Validações

### Schemas Zod

#### createPermissionSchema
```typescript
{
  name: string; // mínimo 1, máximo 255 caracteres
  description?: string; // opcional
  resource: string; // mínimo 1, máximo 100 caracteres
  action: string; // mínimo 1, máximo 50 caracteres
}
```

#### updatePermissionSchema
```typescript
{
  id: string; // obrigatório
  name: string; // mínimo 1, máximo 255 caracteres
  description?: string; // opcional
  resource: string; // mínimo 1, máximo 100 caracteres
  action: string; // mínimo 1, máximo 50 caracteres
}
```

#### manageRolePermissionsSchema
```typescript
{
  roleId: string; // obrigatório
  permissionIds: string[]; // array não vazio
}
```

#### manageUserPermissionsSchema
```typescript
{
  userId: string; // obrigatório
  permissions: Array<{
    permissionId: string; // obrigatório
    mode: "GRANT" | "DENY"; // obrigatório
    scopeJson?: any; // opcional
  }>;
}
```

### Regras de Negócio
- Nome da permissão deve ser único
- Código da permissão deve ser único (formato: `recurso:ação`)
- Recurso e ação são obrigatórios
- Validação de permissão existente antes de operações
- Proteção contra exclusão de permissões com funções ou usuários associados
- Transações para operações complexas
- Validação de funções e usuários existentes

## 🔗 Integração com Roles e Users

### Integração com Funções
- **Botão de Gerenciamento**: Adicionado botão de escudo na tabela de funções
- **Modal Integrado**: `ManageRolePermissions` integrado na listagem de funções
- **Atualização Automática**: Cache invalido automaticamente após alterações
- **Feedback Visual**: Toast notifications para sucesso/erro

### Integração com Usuários
- **Botão de Gerenciamento**: Adicionado botão de usuário na tabela de usuários
- **Modal Integrado**: `ManageUserPermissions` integrado na listagem de usuários
- **Lógica de Sobrescrita**: Permissões de usuário sobrescrevem as de funções
- **Modo Dual**: Interface para conceder ou negar permissões
- **Atualização Automática**: Cache invalido automaticamente após alterações

### Fluxo de Permissões
1. **Permissões de Função**: Funções têm permissões associadas
2. **Permissões de Usuário**: Usuários podem ter permissões específicas
3. **Sobrescrita**: Permissões de usuário têm prioridade sobre as de função
4. **Modo DENY**: Permissões negadas bloqueiam acesso mesmo se concedidas por função
5. **Modo GRANT**: Permissões concedidas garantem acesso

## 🚀 Como Usar

### 1. Acessar a Página de Permissões
Navegue para `/permissions` (requer permissão `permission:read`)

### 2. Listar Permissões
- A tabela carrega automaticamente
- Use a busca para filtrar por nome/descrição/recurso/ação
- Use os filtros específicos para refinar resultados

### 3. Criar Permissão
- Clique no botão "+" no canto superior direito
- Preencha nome, recurso e ação (obrigatórios)
- A descrição é opcional
- O código será gerado automaticamente

### 4. Editar Permissão
- Clique no ícone de edição na linha da permissão
- Modifique os campos desejados
- O código será atualizado automaticamente

### 5. Excluir Permissão
- Clique no ícone de lixeira na linha da permissão
- Confirme a exclusão no modal
- A permissão será excluída (apenas se não houver dependências)

### 6. Gerenciar Permissões de Funções
Navegue para `/roles` e clique no ícone de escudo

#### Interface de Gerenciamento
- Modal com agrupamento por recurso
- Busca em tempo real
- Checkboxes para seleção múltipla
- Botões para selecionar/limpar todas
- Resumo visual de seleções

### 7. Gerenciar Permissões de Usuários
Navegue para `/users` e clique no ícone de usuário

#### Interface de Gerenciamento
- Modal com agrupamento por recurso
- Checkboxes separados para conceder e negar
- Busca em tempo real
- Botões para conceder/negar todas
- Resumo detalhado de permissões

## 🔧 Configurações

### Variáveis de Ambiente
```env
DATABASE_URL="postgresql://..."
```

### Dependências
- `@prisma/client` - ORM para banco de dados
- `@tanstack/react-query` - Gerenciamento de estado
- `zod` - Validação de schemas
- `next-auth` - Autenticação e permissões
- `@radix-ui/react-dialog` - Modais
- `@radix-ui/react-checkbox` - Checkboxes
- `lucide-react` - Ícones

## 📝 Notas Técnicas

### Performance
- Consultas otimizadas com índices no banco
- Paginação para grandes volumes de dados
- Queries em paralelo quando possível
- Cache inteligente com React Query

### Segurança
- Validação server-side rigorosa
- Verificação de permissões em todas as operações
- Transações para operações complexas
- Proteção contra exclusão de dependências

### Auditoria
- Todas as operações são registradas no AuditLog
- Soft delete para preservar histórico
- Timestamps automáticos
- Registro de mudanças em permissões

### UX/UI
- Interface responsiva e moderna
- Feedback visual para todas as ações
- Estados de loading e erro
- Persistência de configurações do usuário
- Agrupamento inteligente por recurso
- Busca em tempo real
- Controles rápidos para operações em massa

### Integração
- Integração completa com features de usuários e funções
- Cache invalido automaticamente
- Componentes reutilizáveis
- Interface consistente em todo o sistema
