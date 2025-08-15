import type { Category, DocumentDirection } from "@prisma/client"

// Tipo para categoria com informações básicas
export type CategoryWithBasicInfo = Category

// Tipo para categoria com conta contábil relacionada
export type CategoryWithAccount = Category & {
  account: {
    id: string;
    name: string
    code: string | null;
    type: string
  } | null
}

// Tipo para categoria com estatísticas
export type CategoryWithStats = Category & {
  _count: {
    documents: number
  }
}

// Tipo para resposta de categoria
export type CategoryResponse = {
  id: string;
  name: string;
  direction: DocumentDirection;
  description: string | null;
  accountId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
