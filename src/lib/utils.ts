import bcrypt from "bcryptjs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function logError({ error, where }: { error: unknown; where: string }) {
  console.info(`[${where}]`);
  console.error(error);
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}

export const mask = {
  phone: (value: string) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length === 0) {
      return '';
    } else if (cleaned.length <= 2) {
      return `(${cleaned}`;
    } else if (cleaned.length <= 7) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  },
  cpfOrCnpj: (value: string) => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length > 14) return value.slice(0, 18);

    if (cleaned.length <= 11) {
      return cleaned
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    } else {
      return cleaned
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
    }
  },
  currency: (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/[^0-9]/g, "");

    // Se não tem valor, retorna vazio
    if (!cleaned) return "";

    // Converte para número e formata como moeda brasileira
    const number = parseInt(cleaned, 10);
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number / 100);

    return formatted;
  },
};

export function formatCurrency(value: number | string): string {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
}

export function parseCurrencyToDecimal(value: string): string {
  if (!value || value.trim() === '') return '0.00';

  // Remove todos os caracteres não numéricos exceto vírgula e ponto
  const cleaned = value.replace(/[^\d,.-]/g, '');

  // Se tem vírgula, é formato brasileiro (1.000,00)
  if (cleaned.includes(',')) {
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto
    const withoutDots = cleaned.replace(/\./g, '');
    const normalized = withoutDots.replace(',', '.');
    const number = parseFloat(normalized) || 0;
    return number.toFixed(2);
  }

  // Se não tem vírgula, é formato americano (1000.00)
  const number = parseFloat(cleaned) || 0;
  return number.toFixed(2);
}

