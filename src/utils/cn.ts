import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for combining Tailwind CSS classes with proper merge semantics */
export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}
