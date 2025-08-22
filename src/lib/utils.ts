import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian Rupee currency, e.g. 1234.5 -> ₹ 1,234.50
 */
export function inr(amount: number): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  })
  return formatter.format(amount)
}

/**
 * Generate a simple unique id suitable for client-side keys and local objects.
 */
export function uid(): string {
  const timePart = Date.now().toString(36)
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `${timePart}-${randomPart}`
}

/**
 * Returns the ISO date string for the first day of the current month.
 * Example: 2025-08-01T00:00:00.000Z (UTC-based)
 */
export function thisMonthISO(): string {
  const now = new Date()
  const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  return first.toISOString()
}
