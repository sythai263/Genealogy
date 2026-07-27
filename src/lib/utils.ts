import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Escape LIKE/ILIKE wildcards so user input is treated literally. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, '\\$&');
}
