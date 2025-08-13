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
