import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines Tailwind CSS class names into a single string.
 *
 * - `clsx` conditionally includes class names.
 * - `tailwind-merge` resolves conflicting Tailwind utilities
 *   (e.g. "p-2 p-4" becomes just "p-4").
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates initials from a person's name for use in
 * avatar placeholders.
 *
 * Examples:
 * - "John" → "J"
 * - "John Doe" → "JD"
 * - "John Michael Doe" → "JD"
 * - "" or null → "??"
 */
export function getAvatarInitials(name?: string | null): string {
  if (!name?.trim()) return "??";

  const parts = name.trim().split(/\s+/);

  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Formats a value by replacing underscores with spaces.
 *
 * Examples:
 * - "NOT_SUBMITTED" → "NOT SUBMITTED"
 * - "LATE" → "LATE"
 * - undefined → "Not submitted"
 */
export const formatUnderscoreLabel = (
  value: string | undefined,
  defaultValue = "N/A"
) => {
  return value?.replace(/_/g, " ") ?? defaultValue;
};