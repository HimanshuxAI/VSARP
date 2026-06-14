// Utility functions for class merging

import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

/**
 * Merges Tailwind CSS class strings using `clsx` and `tailwind-merge`.
 * This ensures conflicting utility classes are resolved according to Tailwind's precedence.
 *
 * @param {...any} inputs - Class name strings, arrays, or objects compatible with `clsx`.
 * @returns {string} - The merged class string.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
