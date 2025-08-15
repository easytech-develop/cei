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
    const formated = value
      .replace(/[^0-9]/g, "")
      .replace(/([0-9])([0-9]{2}$)/, "$1,$2");

    if (formated.split("").length > 6 && formated.split("").length <= 7)
      return formated.replace(/([0-9]{1})(.)/, "$1.$2");

    if (formated.split("").length > 7 && formated.split("").length <= 8)
      return formated.replace(/([0-9]{2})(.)/, "$1.$2");

    if (formated.split("").length === 9)
      return formated.replace(/([0-9]{3})(.)/, "$1.$2");

    return formated;
  },
};

