import type {
  BillingRule,
  Category,
  Contact,
  CostCenter,
  Document,
  DocumentDirection,
  DocumentStatus,
} from "@prisma/client";

export type DocumentResponse = {
  id: string;
  direction: DocumentDirection;
  contactId: string;
  contact: {
    id: string;
    name: string;
    document: string | null;
  };
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  costCenterId: string | null;
  costCenter: {
    id: string;
    name: string;
  } | null;
  billingRuleId: string | null;
  billingRule: {
    id: string;
    name: string;
  } | null;
  totalAmount: string;
  issueAt: Date;
  dueAt: Date;
  competenceAt: Date;
  status: DocumentStatus;
  documentNumber: string | null;
  fiscalKey: string | null;
  series: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type DocumentWithRelations = Document & {
  contact: Contact;
  category: Category;
  costCenter: CostCenter | null;
  billingRule: BillingRule | null;
};

export type DocumentFilters = {
  search?: string;
  direction?: DocumentDirection[];
  status?: DocumentStatus[];
  contactId?: string;
  categoryId?: string;
  costCenterId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  amountMin?: number;
  amountMax?: number;
};
