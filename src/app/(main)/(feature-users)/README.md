# Feature de Usuários

Esta documentação descreve a feature de gerenciamento de usuários do sistema, incluindo usuários e cargos (roles).

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

A feature de usuários permite o gerenciamento completo de usuários e cargos do sistema, incluindo:

- **CRUD de Usuários**: Criar, listar, atualizar e excluir usuários
- **CRUD de Cargos**: Criar, listar, atualizar e excluir cargos
- **Gerenciamento de Cargos**: Associar usuários a cargos específicos
- **Controle de Status**: Ativar/suspender usuários
- **Soft Delete**: Exclusão lógica com possibilidade de restauração
- **Validações**: Validação de dados e regras de negócio
- **Interface Responsiva**: Interface moderna com tabela de dados

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
Tabela de cargos/funções do sistema.

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
- `id`: Identificador único do cargo (UUID v7)
- `slug`: Slug único do cargo (ex: "ADMIN", "DIRECTOR")
- `name`: Nome descritivo do cargo
- `createdAt`: Data de criação
- `updatedAt`: Data da última atualização

### UserRole
Tabela de relacionamento entre usuários e cargos (N:N).

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
- `roleId`: ID do cargo
- `createdAt`: Data de criação da associação
- `updatedAt`: Data da última atualização
- `deletedAt`: Data de exclusão da associação (soft delete)

**Relacionamentos:**
- Um usuário pode ter múltiplos cargos
- Um cargo pode ser atribuído a múltiplos usuários
- Exclusão em cascata quando usuário ou cargo é removido

## 📁 Estrutura de Arquivos

```
src/app/(main)/(users)/
├── README.md                    # Esta documentação
├── users/                       # Página principal de usuários
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
│   └── roles.ts                # Hooks React Query para cargos
└── server/
    └── users.ts                # Funções server-side (APIs)
```

## ⚙️ Funcionalidades

### 1. Listagem de Usuários
- **Paginação**: Suporte a paginação com limite configurável
- **Busca**: Busca por nome e email
- **Filtros**: Filtro por cargos específicos
- **Ordenação**: Ordenação por data de criação e nome
- **Status**: Exibe apenas usuários ativos (não deletados)

### 2. Criação de Usuário
- **Validações**: Validação de campos obrigatórios
- **Email Único**: Verificação de email duplicado
- **Restauração**: Restaura usuário deletado se email existir
- **Hash de Senha**: Senha criptografada com bcrypt
- **Associação de Cargo**: Criação automática da relação UserRole

### 3. Atualização de Usuário
- **Validações**: Validação de dados de entrada
- **Email Único**: Verificação de email duplicado (exceto próprio)
- **Transação**: Atualização atômica de usuário e cargos
- **Auditoria**: Registro de alterações

### 4. Exclusão de Usuário
- **Soft Delete**: Exclusão lógica (marca deletedAt)
- **Validação**: Verifica se usuário existe e não está deletado
- **Auditoria**: Registro da exclusão

### 5. Gerenciamento de Cargos
- **Listagem**: Lista todos os cargos disponíveis
- **Associação**: Associa usuários a cargos específicos
- **Validação**: Verifica se cargo existe

### 6. CRUD de Cargos
- **Listagem de Cargos**: Lista cargos com paginação e busca
- **Criação de Cargo**: Cria novos cargos com validação de slug único
- **Atualização de Cargo**: Atualiza informações de cargos existentes
- **Exclusão de Cargo**: Exclui cargos (apenas se não houver usuários associados)
- **Validações**: Validação de nome e slug obrigatórios
- **Slug Único**: Verificação de slug duplicado
- **Proteção**: Impede exclusão de cargos com usuários associados

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
  roleId: string;
})
```

### updateUser
Atualiza um usuário existente.

```typescript
updateUser(id: string, {
  name: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED";
  roleId: string;
})
```

### deleteUser
Exclui um usuário (soft delete).

```typescript
deleteUser(id: string)
```

### getRoles
Lista cargos com paginação e filtros.

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
Cria um novo cargo.

```typescript
createRole({
  name: string;
  slug: string;
})
```

### updateRole
Atualiza um cargo existente.

```typescript
updateRole(id: string, {
  name: string;
  slug: string;
})
```

### deleteRole
Exclui um cargo (apenas se não houver usuários associados).

```typescript
deleteRole(id: string)
```

## 🧩 Componentes

### ListUsers
Tabela responsiva com listagem de usuários.

**Funcionalidades:**
- Paginação automática
- Busca em tempo real
- Filtros por cargo
- Ações de edição e exclusão
- Persistência de estado no localStorage

### CreateUser
Modal para criação de usuários.

**Campos:**
- Nome (obrigatório)
- Email (obrigatório, único)
- Senha (obrigatório, mínimo 6 caracteres)
- Status (ACTIVE/SUSPENDED)
- Cargo (obrigatório)

### UpdateUser
Modal para edição de usuários.

**Campos:**
- Nome (obrigatório)
- Email (obrigatório, único)
- Status (ACTIVE/SUSPENDED)
- Cargo (obrigatório)

### DeleteUser
Modal de confirmação para exclusão.

**Funcionalidades:**
- Confirmação antes da exclusão
- Exclusão lógica (soft delete)
- Feedback visual

### ListRoles
Tabela responsiva com listagem de cargos.

**Funcionalidades:**
- Paginação automática
- Busca em tempo real
- Ações de edição e exclusão
- Persistência de estado no localStorage

### CreateRole
Modal para criação de cargos.

**Campos:**
- Nome (obrigatório)
- Slug (obrigatório, único, convertido para maiúsculas)

### UpdateRole
Modal para edição de cargos.

**Campos:**
- Nome (obrigatório)
- Slug (obrigatório, único, convertido para maiúsculas)

### DeleteRole
Modal de confirmação para exclusão de cargos.

**Funcionalidades:**
- Confirmação antes da exclusão
- Verificação de usuários associados
- Feedback visual

## ✅ Validações

### Schemas Zod
- **createUserSchema**: Validação para criação
- **updateUserSchema**: Validação para atualização
- **changePasswordSchema**: Validação para alteração de senha
- **createRoleSchema**: Validação para criação de cargos
- **updateRoleSchema**: Validação para atualização de cargos

### Regras de Negócio
- Email deve ser único (exceto próprio na edição)
- Senha mínima de 6 caracteres
- Cargo é obrigatório
- Nome e email são obrigatórios
- Validação de usuário existente antes de operações
- Slug de cargo deve ser único
- Nome de cargo é obrigatório
- Validação de cargo existente antes de operações
- Proteção contra exclusão de cargos com usuários associados

### Validações Server-Side
- Verificação de email duplicado
- Validação de usuário existente
- Verificação de soft delete
- Transações para operações complexas
- Verificação de slug duplicado
- Validação de cargo existente
- Verificação de usuários associados antes da exclusão

## 🔐 Permissões

A feature de usuários utiliza o sistema de permissões do NextAuth:

### Permissões Necessárias
- `user:read` - Visualizar usuários
- `user:create` - Criar usuários
- `user:update` - Atualizar usuários
- `user:delete` - Excluir usuários
- `role:read` - Visualizar cargos
- `role:create` - Criar cargos
- `role:update` - Atualizar cargos
- `role:delete` - Excluir cargos

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
- Use os filtros de cargo para refinar resultados

### 3. Criar Usuário
- Clique no botão "+" no canto superior direito
- Preencha todos os campos obrigatórios
- Selecione um cargo
- Clique em "Criar"

### 4. Editar Usuário
- Clique no ícone de edição na linha do usuário
- Modifique os campos desejados
- Clique em "Salvar"

### 5. Excluir Usuário
- Clique no ícone de lixeira na linha do usuário
- Confirme a exclusão no modal
- O usuário será marcado como deletado

### 6. Gerenciar Cargos
Navegue para `/roles` (requer permissão `role:read`)

#### Listar Cargos
- A tabela carrega automaticamente
- Use a busca para filtrar por nome/slug

#### Criar Cargo
- Clique no botão "+" no canto superior direito
- Preencha nome e slug (obrigatórios)
- O slug será convertido automaticamente para maiúsculas
- Clique em "Criar"

#### Editar Cargo
- Clique no ícone de edição na linha do cargo
- Modifique os campos desejados
- Clique em "Salvar"

#### Excluir Cargo
- Clique no ícone de lixeira na linha do cargo
- Confirme a exclusão no modal
- O cargo será excluído (apenas se não houver usuários associados)

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

## 📝 Notas Técnicas

### Performance
- Consultas otimizadas com índices no banco
- Paginação para grandes volumes de dados
- Queries em paralelo quando possível

### Segurança
- Senhas criptografadas com bcrypt
- Validação server-side rigorosa
- Verificação de permissões em todas as operações

### Auditoria
- Todas as operações são registradas no AuditLog
- Soft delete para preservar histórico
- Timestamps automáticos

### UX/UI
- Interface responsiva e moderna
- Feedback visual para todas as ações
- Estados de loading e erro
- Persistência de configurações do usuário
