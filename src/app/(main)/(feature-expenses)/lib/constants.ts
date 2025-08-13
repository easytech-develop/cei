// Status de despesas
export const EXPENSE_STATUS = {
  DRAFT: "DRAFT",
  OPEN: "OPEN",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
} as const;

// Status de parcelas
export const INSTALLMENT_STATUS = {
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
} as const;

// Métodos de pagamento
export const PAYMENT_METHODS = {
  PIX: "PIX",
  TED: "TED",
  DOC: "DOC",
  BOLETO: "BOLETO",
  CARTAO_CREDITO: "CARTAO_CREDITO",
  CARTAO_DEBITO: "CARTAO_DEBITO",
  DINHEIRO: "DINHEIRO",
  CHEQUE: "CHEQUE",
} as const;

// Tipos de conta
export const ACCOUNT_TYPES = {
  CASH: "CASH",
  BANK: "BANK",
} as const;

// Opções para filtros de status
export const EXPENSE_STATUS_OPTIONS = [
  { value: EXPENSE_STATUS.DRAFT, label: "Rascunho" },
  { value: EXPENSE_STATUS.OPEN, label: "Aberto" },
  { value: EXPENSE_STATUS.PARTIALLY_PAID, label: "Parcial" },
  { value: EXPENSE_STATUS.PAID, label: "Pago" },
  { value: EXPENSE_STATUS.CANCELLED, label: "Cancelado" },
] as const;

// Opções para status de parcelas
export const INSTALLMENT_STATUS_OPTIONS = [
  { value: INSTALLMENT_STATUS.PENDING, label: "Pendente" },
  { value: INSTALLMENT_STATUS.PARTIAL, label: "Parcial" },
  { value: INSTALLMENT_STATUS.PAID, label: "Pago" },
  { value: INSTALLMENT_STATUS.CANCELLED, label: "Cancelado" },
] as const;

// Opções para métodos de pagamento
export const PAYMENT_METHOD_OPTIONS = [
  { value: PAYMENT_METHODS.PIX, label: "PIX" },
  { value: PAYMENT_METHODS.TED, label: "TED" },
  { value: PAYMENT_METHODS.DOC, label: "DOC" },
  { value: PAYMENT_METHODS.BOLETO, label: "Boleto" },
  { value: PAYMENT_METHODS.CARTAO_CREDITO, label: "Cartão de Crédito" },
  { value: PAYMENT_METHODS.CARTAO_DEBITO, label: "Cartão de Débito" },
  { value: PAYMENT_METHODS.DINHEIRO, label: "Dinheiro" },
  { value: PAYMENT_METHODS.CHEQUE, label: "Cheque" },
] as const;

// Opções para tipos de conta
export const ACCOUNT_TYPE_OPTIONS = [
  { value: ACCOUNT_TYPES.CASH, label: "Caixa" },
  { value: ACCOUNT_TYPES.BANK, label: "Banco" },
] as const;

// Configurações de paginação
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Configurações de filtros de data
export const DATE_FILTER_OPTIONS = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "this_week", label: "Esta semana" },
  { value: "last_week", label: "Semana passada" },
  { value: "this_month", label: "Este mês" },
  { value: "last_month", label: "Mês passado" },
  { value: "this_year", label: "Este ano" },
  { value: "last_year", label: "Ano passado" },
  { value: "custom", label: "Personalizado" },
] as const;

// Configurações de ordenação
export const SORT_OPTIONS = [
  { value: "description", label: "Descrição" },
  { value: "competenceDate", label: "Data de Competência" },
  { value: "totalNet", label: "Valor Total" },
  { value: "status", label: "Status" },
  { value: "createdAt", label: "Data de Criação" },
] as const;

// Configurações de ordenação de direção
export const SORT_DIRECTION_OPTIONS = [
  { value: "asc", label: "Crescente" },
  { value: "desc", label: "Decrescente" },
] as const;

// Limites para upload de arquivos
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  ALLOWED_EXTENSIONS: [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".txt",
  ],
} as const;

// Configurações de notificações
export const NOTIFICATION_CONFIG = {
  SUCCESS_DURATION: 5000,
  ERROR_DURATION: 10000,
  WARNING_DURATION: 7000,
} as const;

// Configurações de cache
export const CACHE_CONFIG = {
  EXPENSE_LIST: 5 * 60 * 1000, // 5 minutos
  EXPENSE_DETAIL: 5 * 60 * 1000, // 5 minutos
  EXPENSE_STATS: 10 * 60 * 1000, // 10 minutos
  OVERDUE_INSTALLMENTS: 5 * 60 * 1000, // 5 minutos
  UPCOMING_INSTALLMENTS: 5 * 60 * 1000, // 5 minutos
} as const;

// Configurações de validação
export const VALIDATION_CONFIG = {
  MIN_DESCRIPTION_LENGTH: 1,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_ITEM_NAME_LENGTH: 1,
  MAX_ITEM_NAME_LENGTH: 200,
  MIN_QUANTITY: 0.001,
  MAX_QUANTITY: 999999.9999,
  MIN_UNIT_PRICE: 0.01,
  MAX_UNIT_PRICE: 999999.99,
  MIN_TOTAL: 0.01,
  MAX_TOTAL: 999999999.99,
  MIN_INSTALLMENT_AMOUNT: 0.01,
  MAX_INSTALLMENT_AMOUNT: 999999999.99,
  MAX_INSTALLMENTS: 100,
  MAX_ITEMS: 100,
  MAX_ATTACHMENTS: 10,
} as const;

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: "Este campo é obrigatório",
  INVALID_EMAIL: "E-mail inválido",
  INVALID_DATE: "Data inválida",
  INVALID_NUMBER: "Número inválido",
  MIN_LENGTH: (min: number) => `Mínimo de ${min} caracteres`,
  MAX_LENGTH: (max: number) => `Máximo de ${max} caracteres`,
  MIN_VALUE: (min: number) => `Valor mínimo: ${min}`,
  MAX_VALUE: (max: number) => `Valor máximo: ${max}`,
  FILE_TOO_LARGE: (maxSize: string) => `Arquivo muito grande. Máximo: ${maxSize}`,
  INVALID_FILE_TYPE: "Tipo de arquivo não permitido",
  NETWORK_ERROR: "Erro de conexão. Tente novamente.",
  UNKNOWN_ERROR: "Erro desconhecido. Tente novamente.",
} as const;

// Configurações de formatação
export const FORMAT_CONFIG = {
  CURRENCY: {
    locale: "pt-BR",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  DATE: {
    locale: "pt-BR",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  },
  DATETIME: {
    locale: "pt-BR",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
} as const;
