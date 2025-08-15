import type { Contact, ContactRole, DocumentDirection, DocumentStatus } from "@prisma/client"

// Tipo para contato com informações básicas
export type ContactWithBasicInfo = Contact

// Tipo para contato com documentos relacionados
export type ContactWithDocuments = Contact & {
  documents: Array<{
    id: string
    direction: DocumentDirection
    totalAmount: number
    status: DocumentStatus
    issueAt: Date
    dueAt: Date
  }>
}

// Tipo para contato com estatísticas
export type ContactWithStats = Contact & {
  _count: {
    documents: number
  }
  _sum: {
    documents: {
      totalAmount: number | null
    }
  }
}

// Tipo para resposta de contato
export type ContactResponse = {
  id: string
  name: string
  document: string | null
  email: string | null
  phone: string | null
  address: string | null
  roles: ContactRole[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
