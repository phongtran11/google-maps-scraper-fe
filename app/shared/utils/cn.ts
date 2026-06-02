import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS classes dynamically, handling conflicts.
 *
 * @param inputs - List of class names, arrays, or objects to be combined.
 * @returns A consolidated, deduplicated className string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
