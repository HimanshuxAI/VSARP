import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx.
 * Resolves style conflicts.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
