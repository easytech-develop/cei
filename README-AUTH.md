# Sistema de Autenticação - CEI

## Implementação Simplificada

Este sistema de autenticação foi implementado de forma simples e segura para uso interno da empresa, utilizando apenas a tabela `User` existente.

## O que foi implementado:

### 1. **Autenticação Básica**
- Login com email e senha
- Senhas criptografadas com bcrypt
- Sessões JWT seguras
- Proteção de rotas com middleware

### 2. **Estrutura de Arquivos**
```
src/
├── lib/auth/
│   ├── auth.ts          # Configuração do NextAuth
│   ├── types.ts         # Tipos TypeScript
│   └── hooks.ts         # Hooks personalizados
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # API route
│   ├── auth/
│   │   ├── signin/page.tsx              # Página de login
│   │   └── error/page.tsx               # Página de erro
│   └── page.tsx                         # Página principal
├── components/
│   └── providers.tsx                    # Providers (incluindo SessionProvider)
└── middleware.ts                        # Middleware de proteção
```

### 3. **Configuração Necessária**

#### Variáveis de Ambiente (.env.local)
```env
# NextAuth
NEXTAUTH_SECRET=sua-chave-secreta-aqui
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cei_db"
```

#### Gerar chave secreta:
```bash
openssl rand -base64 32
```

### 4. **Como usar**

#### 1. Configurar banco de dados:
```bash
# Aplicar migrações
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate
```

#### 2. Criar usuário inicial:
```bash
# Instalar tsx (se necessário)
npm install --save-dev tsx

# Executar script para criar usuário
npm run create-user
```

**Credenciais padrão:**
- Email: `admin@cei.com`
- Senha: `admin123`

#### 3. Iniciar aplicação:
```bash
npm run dev
```

#### 4. Acessar:
- URL: `http://localhost:3000`
- Será redirecionado para `/auth/signin` se não estiver logado

### 5. **Funcionalidades**

#### Hooks disponíveis:
```typescript
import { useAuth, useRequireAuth } from '@/lib/auth/hooks';

// Hook básico
const { session, isAuthenticated, isLoading } = useAuth();

// Hook para proteger rotas
const { session, isAuthenticated } = useRequireAuth('/auth/signin');
```

#### Proteção de rotas:
```typescript
// Em qualquer componente
const { isAuthenticated } = useRequireAuth();

if (!isAuthenticated) {
  return <div>Carregando...</div>;
}
```

#### Logout:
```typescript
import { signOut } from 'next-auth/react';

<button onClick={() => signOut({ callbackUrl: '/auth/signin' })}>
  Sair
</button>
```

### 6. **Segurança**

- ✅ Senhas criptografadas com bcrypt (12 rounds)
- ✅ Sessões JWT assinadas
- ✅ Cookies HttpOnly e Secure
- ✅ Proteção CSRF automática
- ✅ Middleware de proteção de rotas
- ✅ Validação de status do usuário (ACTIVE/SUSPENDED)

### 7. **Estrutura do Usuário**

```typescript
// Dados disponíveis na sessão
session.user = {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "SUSPENDED";
}
```

### 8. **Próximos Passos**

1. **Personalizar interface:**
   - Modificar páginas de login/erro
   - Adicionar logo da empresa
   - Customizar cores e estilos

2. **Adicionar funcionalidades:**
   - Recuperação de senha
   - Alteração de senha
   - Perfil do usuário

3. **Segurança adicional:**
   - Rate limiting
   - Logs de auditoria
   - Bloqueio por tentativas

### 9. **Troubleshooting**

#### Erro de permissão no Prisma:
```bash
# Parar o servidor de desenvolvimento
# Deletar pasta .prisma
rm -rf node_modules/.prisma
# Reinstalar dependências
npm install
# Gerar cliente novamente
npx prisma generate
```

#### Erro de conexão com banco:
- Verificar DATABASE_URL
- Verificar se o banco está rodando
- Verificar credenciais

#### Erro de autenticação:
- Verificar NEXTAUTH_SECRET
- Verificar se o usuário existe no banco
- Verificar se o status é ACTIVE

## Sistema Pronto para Uso

O sistema está configurado e pronto para uso interno. É simples, seguro e fácil de manter. Pode ser facilmente estendido conforme necessário.
