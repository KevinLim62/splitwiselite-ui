import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyCodes = [
  "USD", // United States Dollar
  "EUR", // Euro
  "CZK",
  "GBP", // British Pound Sterling
  "AUD", // Australian Dollar
  "CAD", // Canadian Dollar
  "CHF", // Swiss Franc
  "CNY", // Chinese Yuan
  "RUB", // Russian Ruble
  "BRL", // Brazilian Real
  "SGD", // Singapore Dollar
  "NZD", // New Zealand Dollar
  "MXN", // Mexican Peso
  "HKD", // Hong Kong Dollar
  "SEK", // Swedish Krona
  "NOK", // Norwegian Krone
  "DKK", // Danish Krone
  "PLN", // Polish Zloty
  "TRY", // Turkish Lira
  "KRW", // South Korean Won
  "THB", // Thai Baht
  "MYR", // Malaysian Ringgit
  "IDR", // Indonesian Rupiah
  "PHP", // Philippine Peso
  "VND", // Vietnamese Dong
  "SAR", // Saudi Riyal
  "AED", // United Arab Emirates Dirham
  "ILS", // Israeli New Shekel
] as const;
