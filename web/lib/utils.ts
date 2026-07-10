import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarInitials(name?: string | null): string {
  if (!name?.trim()) return "??";

  const parts = name.trim().split(/\s+/);

  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
