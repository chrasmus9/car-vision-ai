import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceStr: string): string {
  const num = parseInt(priceStr.replace(/\D/g, ""));
  if (isNaN(num) || num === 0) return priceStr;
  const suffix = priceStr.toLowerCase().includes("kr") ? " kr" : "";
  return num.toLocaleString("nb-NO") + suffix;
}
