# Feature de Usuários

Esta documentação descreve a feature de gerenciamento de usuários do sistema, incluindo usuários e funções (roles).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tabelas do Schema](#tabelas-do-schema)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Funcionalidades](#funcionalidades)
- [APIs](#apis)
- [Componentes](#componentes)
- [Validações](#validações)
- [Permissões](#permissões)

## 🎯 Visão Geral

A feature de usuários permite o gerenciamento completo de usuários e funções do sistema, incluindo:

- **CRUD de Usuários**: Criar, listar, atualizar e excluir usuários
- **CRUD de Funções**: Criar, listar, atualizar e excluir funções
- **Gerenciamento de Funções**: Associar usuários a múltiplos funções específicos
- **Controle de Status**: Ativar/suspender usuários
- **Soft Delete**: Exclusão lógica com possibilidade de restauração
- **Validações**: Validação de dados e regras de negócio
- **Interface Responsiva**: Interface moderna com tabela de dados
- **Seleção Múltipla de Roles**: Interface avançada com popover e command para seleção de funções

## 🗄️ Tabelas do Schema

### User
Tabela principal de usuários do sistema.

```prisma
model User {
  id           String     @id @default(uuid(7))
  name         String
  email        String     @unique
  passwordHash String
  status       UserStatus @default(ACTIVE)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  deletedAt    DateTime?

  Roles           UserRole[]
  UserPermissions UserPermission[]
  AuditLogs       AuditLog[]

  // NextAuth fields
  emailVerified DateTime?
  image         String?
}
```

**Campos:**
- `id`: Identificador único do usuário (UUID v7)
- `name`: Nome completo do usuário
- `email`: Email único do usuário
- `passwordHash`: Hash da senha (bcrypt)
- `status`: Status do usuário (ACTIVE/SUSPENDED)
- `createdAt`: Data de criação
- `updatedAt`: Data da última atualização
- `deletedAt`: Data de exclusão (soft delete)
- `emailVerified`: Data de verificação do email (NextAuth)
- `image`: URL da imagem do usuário (NextAuth)

### Role
Tabela de funções/funções do sistema.

```prisma
model Role {
  id        String   @id @default(uuid(7))
  slug      String   @unique // "ADMIN", "DIRECTOR", "SECRETARY", "TEACHER"
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  RolePermissions RolePermission[]
  Users           UserRole[]
}
```

**Campos:**
- `id`: Identificador único do função (UUID v7)
- `slug`: Slug único do função (ex: "ADMIN", "DIRECTOR")
- `name`: Nome descritivo do função
- `createdAt`: Data de criação
- `updatedAt`: Data da última atualização

### UserRole
Tabela de relacionamento entre usuários e funções (N:N).

```prisma
model UserRole {
  userId    String
  roleId    String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  User User @relation(fields: [userId], references: [id], onDelete: Cascade)
  Role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
}
```

**Campos:**
- `userId`: ID do usuário
- `roleId`: ID do função
- `createdAt`: Data de criação da associação
- `updatedAt`: Data da última atualização
- `deletedAt`: Data de exclusão da associação (soft delete)

**Relacionamentos:**
- Um usuário pode ter múltiplos funções
- Um função pode ser atribuído a múltiplos usuários
- Exclusão em cascata quando usuário ou função é removido

## 📁 Estrutura de Arquivos

```
src/app/(main)/(feature-users)/
├── README.md                    # Esta documentação
├── (pages)/users/               # Página principal de usuários
│   ├── page.tsx                # Página de listagem
│   └── _components/            # Componentes da interface
│       ├── create-user.tsx     # Modal de criação
│       ├── delete-user.tsx     # Modal de exclusão
│       ├── list-users.tsx      # Tabela de usuários
│       └── update-user.tsx     # Modal de edição
├── types/
│   └── users.ts                # Tipos TypeScript
├── queries/
│   ├── users.ts                # Hooks React Query para usuários
│   └── roles.ts                # Hooks React Query para funções
├── server/
│   └── users.ts                # Funções server-side (APIs)
└── validators/
    └── users.ts                # Schemas de validação Zod
```

## ⚙️ Funcionalidades

### 1. Listagem de Usuários
- **Paginação**: Suporte a paginação com limite configurável
- **Busca**: Busca por nome e email
- **Filtros**: Filtro por funções específicos com seleção múltipla
- **Ordenação**: Ordenação por data de criação e nome
- **Status**: Exibe apenas usuários ativos (não deletados)
- **Exibição de Roles**: Mostra no máximo 2 roles por usuário com indicador "+X" para roles adicionais

### 2. Criação de Usuário
- **Validações**: Validação de campos obrigatórios
- **Email Único**: Verificação de email duplicado
- **Restauração**: Restaura usuário deletado se email existir
- **Hash de Senha**: Senha criptografada com bcrypt
- **Seleção Múltipla de Roles**: Interface com popover e command para seleção de múltiplos funções
- **Validação de Roles**: Pelo menos um função é obrigatório

### 3. Atualização de Usuário
- **Validações**: Validação de dados de entrada
- **Email Único**: Verificação de email duplicado (exceto próprio)
- **Transação**: Atualização atômica de usuário e funções
- **Seleção Múltipla de Roles**: Interface consistente com criação
- **Auditoria**: Registro de alterações

### 4. Exclusão de Usuário
- **Soft Delete**: Exclusão lógica (marca deletedAt)
- **Validação**: Verifica se usuário existe e não está deletado
- **Auditoria**: Registro da exclusão

### 5. Gerenciamento de Funções
- **Listagem**: Lista todos os funções disponíveis
- **Associação Múltipla**: Associa usuários a múltiplos funções específicos
- **Validação**: Verifica se função existe
- **Interface Avançada**: Popover com command para melhor UX

### 6. CRUD de Funções
- **Listagem de Funções**: Lista funções com paginação e busca
- **Criação de Função**: Cria novos funções com validação de slug único
- **Atualização de Função**: Atualiza informações de funções existentes
- **Exclusão de Função**: Exclui funções (apenas se não houver usuários associados)
- **Validações**: Validação de nome e slug obrigatórios
- **Slug Único**: Verificação de slug duplicado
- **Proteção**: Impede exclusão de funções com usuários associados

## 🔌 APIs

### getUsers
Lista usuários com paginação e filtros.

```typescript
getUsers({
  meta: { page: 1, limit: 10 },
  filters?: {
    search?: string;
    roles?: string[];
  }
})
```

**Retorna:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    users: UserWithRoles[];
    meta: Meta;
  };
}
```

### createUser
Cria um novo usuário.

```typescript
createUser({
  name: string;
  email: string;
  password: string;
  status: "ACTIVE" | "SUSPENDED";
  roles: string[]; // Array de IDs de roles
})
```

### updateUser
Atualiza um usuário existente.

```typescript
updateUser(id: string, {
  name: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED";
  roles: string[]; // Array de IDs de roles
})
```

### deleteUser
Exclui um usuário (soft delete).

```typescript
deleteUser(id: string)
```

### getRoles
Lista funções com paginação e filtros.

```typescript
getRoles({
  meta: { page: 1, limit: 10 },
  filters?: {
    search?: string;
  }
})
```

**Retorna:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    roles: Role[];
    meta: Meta;
  };
}
```

### createRole
Cria um novo função.

```typescript
createRole({
  name: string;
  slug: string;
})
```

### updateRole
Atualiza um função existente.

```typescript
updateRole(id: string, {
  name: string;
  slug: string;
})
```

### deleteRole
Exclui um função (apenas se não houver usuários associados).

```typescript
deleteRole(id: string)
```

## 🧩 Componentes

### ListUsers
Tabela responsiva com listagem de usuários.

**Funcionalidades:**
- Paginação automática
- Busca em tempo real
- Filtros por função com seleção múltipla
- Ações de edição e exclusão
- Persistência de estado no localStorage
- **Exibição limitada de roles**: Máximo 2 roles visíveis com indicador "+X"

### CreateUser
Modal para criação de usuários.

**Campos:**
- Nome (obrigatório)
- Email (obrigatório, único)
- Senha (obrigatório, mínimo 6 caracteres)
- Status (ACTIVE/SUSPENDED)
- **Roles (obrigatório)**: Seleção múltipla com popover e command

**Interface de Seleção de Roles:**
- Popover com interface de comando
- Busca em tempo real
- Seleção múltipla com checkboxes
- Opção para limpar seleção
- Indicador visual de itens selecionados

### UpdateUser
Modal para edição de usuários.

**Campos:**
- Nome (obrigatório)
- Email (obrigatório, único)
- Status (ACTIVE/SUSPENDED)
- **Roles (obrigatório)**: Seleção múltipla com popover e command

**Interface de Seleção de Roles:**
- Mesma interface do CreateUser para consistência
- Pré-seleção dos roles atuais do usuário
- Validação de pelo menos um role

### DeleteUser
Modal de confirmação para exclusão.

**Funcionalidades:**
- Confirmação antes da exclusão
- Exclusão lógica (soft delete)
- Feedback visual

### ListRoles
Tabela responsiva com listagem de funções.

**Funcionalidades:**
- Paginação automática
- Busca em tempo real
- Ações de edição e exclusão
- Persistência de estado no localStorage

### CreateRole
Modal para criação de funções.

**Campos:**
- Nome (obrigatório)
- Slug (obrigatório, único, convertido para maiúsculas)

### UpdateRole
Modal para edição de funções.

**Campos:**
- Nome (obrigatório)
- Slug (obrigatório, único, convertido para maiúsculas)

### DeleteRole
Modal de confirmação para exclusão de funções.

**Funcionalidades:**
- Confirmação antes da exclusão
- Verificação de usuários associados
- Feedback visual

## ✅ Validações

### Schemas Zod

#### createUserSchema
```typescript
{
  name: string; // mínimo 1 caractere
  email: string; // email válido
  password: string; // mínimo 6 caracteres
  status: "ACTIVE" | "SUSPENDED";
  roles: string[]; // array não vazio
}
```

#### updateUserSchema
```typescript
{
  name: string; // mínimo 1, máximo 255 caracteres
  email: string; // email válido, máximo 255 caracteres
  status: "ACTIVE" | "SUSPENDED";
  roles: string[]; // array não vazio
}
```

#### changePasswordSchema
```typescript
{
  currentPassword: string;
  newPassword: string; // mínimo 6 caracteres
  confirmPassword: string; // deve coincidir com newPassword
}
```

### Regras de Negócio
- Email deve ser único (exceto próprio na edição)
- Senha mínima de 6 caracteres
- **Pelo menos um role é obrigatório**
- Nome e email são obrigatórios
- Validação de usuário existente antes de operações
- Slug de função deve ser único
- Nome de função é obrigatório
- Validação de função existente antes de operações
- Proteção contra exclusão de funções com usuários associados

### Validações Server-Side
- Verificação de email duplicado
- Validação de usuário existente
- Verificação de soft delete
- Transações para operações complexas
- Verificação de slug duplicado
- Validação de função existente
- Verificação de usuários associados antes da exclusão
- **Validação de array de roles não vazio**

## 🔐 Permissões

A feature de usuários utiliza o sistema de permissões do NextAuth:

### Permissões Necessárias
- `user:read` - Visualizar usuários
- `user:create` - Criar usuários
- `user:update` - Atualizar usuários
- `user:delete` - Excluir usuários
- `role:read` - Visualizar funções
- `role:create` - Criar funções
- `role:update` - Atualizar funções
- `role:delete` - Excluir funções

### Verificação de Permissões
```typescript
if (!(await can("user:read"))) {
  redirect("/dashboard?error=no_permission");
}
```

## 🚀 Como Usar

### 1. Acessar a Página
Navegue para `/users` (requer permissão `user:read`)

### 2. Listar Usuários
- A tabela carrega automaticamente
- Use a busca para filtrar por nome/email
- Use os filtros de função para refinar resultados (seleção múltipla)
- **Roles são exibidos com limite de 2 visíveis + indicador de quantidade**

### 3. Criar Usuário
- Clique no botão "+" no canto superior direito
- Preencha todos os campos obrigatórios
- **Selecione um ou mais funções usando o popover de seleção**
- Clique em "Criar"

### 4. Editar Usuário
- Clique no ícone de edição na linha do usuário
- Modifique os campos desejados
- **Gerencie os funções usando a interface de seleção múltipla**
- Clique em "Salvar"

### 5. Excluir Usuário
- Clique no ícone de lixeira na linha do usuário
- Confirme a exclusão no modal
- O usuário será marcado como deletado

### 6. Gerenciar Funções
Navegue para `/roles` (requer permissão `role:read`)

#### Listar Funções
- A tabela carrega automaticamente
- Use a busca para filtrar por nome/slug

#### Criar Função
- Clique no botão "+" no canto superior direito
- Preencha nome e slug (obrigatórios)
- O slug será convertido automaticamente para maiúsculas
- Clique em "Criar"

#### Editar Função
- Clique no ícone de edição na linha do função
- Modifique os campos desejados
- Clique em "Salvar"

#### Excluir Função
- Clique no ícone de lixeira na linha do função
- Confirme a exclusão no modal
- O função será excluído (apenas se não houver usuários associados)

## 🔧 Configurações

### Variáveis de Ambiente
```env
DATABASE_URL="postgresql://..."
```

### Dependências
- `@prisma/client` - ORM para banco de dados
- `@tanstack/react-query` - Gerenciamento de estado
- `zod` - Validação de schemas
- `bcrypt` - Hash de senhas
- `next-auth` - Autenticação e permissões
- `@radix-ui/react-popover` - Componentes de interface
- `@radix-ui/react-command` - Interface de comando

## 📝 Notas Técnicas

### Performance
- Consultas otimizadas com índices no banco
- Paginação para grandes volumes de dados
- Queries em paralelo quando possível
- **Limitação de exibição de roles para melhor performance visual**

### Segurança
- Senhas criptografadas com bcrypt
- Validação server-side rigorosa
- Verificação de permissões em todas as operações
- **Validação de array de roles para prevenir dados inválidos**

### Auditoria
- Todas as operações são registradas no AuditLog
- Soft delete para preservar histórico
- Timestamps automáticos
- **Registro de mudanças em múltiplos roles**

### UX/UI
- Interface responsiva e moderna
- Feedback visual para todas as ações
- Estados de loading e erro
- Persistência de configurações do usuário
- **Interface avançada de seleção múltipla de roles**
- **Exibição otimizada de roles na tabela**
- **Popover com command para melhor usabilidade**

### Mudanças Recentes (v2.0)
- **Suporte a múltiplos roles por usuário**
- **Novo schema com roles como array**
- **Interface de seleção com popover e command**
- **Limitação de exibição de roles na tabela (máximo 2)**
- **Melhorias na validação e feedback visual**
- **Consistência entre componentes CreateUser e UpdateUser**
