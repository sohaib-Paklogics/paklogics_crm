import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  return text.length > maxLength
    ? text.slice(0, maxLength).trim() + "..."
    : text;
}

export const convertToFormData = (data: Record<string, any>): FormData => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      form.append(key, value);
    }
  });
  return form;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const e164Regex = /^\+[1-9]\d{7,14}$/;
  return e164Regex.test(phone);
};

// utils/debounce.ts
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}
