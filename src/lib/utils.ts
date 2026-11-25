import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Vibrate only after a real tap; Chrome logs a console error for vibrate() without user activation. */
export function haptic(pattern: number | number[]) {
  try {
    const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (ua && !ua.hasBeenActive) return;
    navigator.vibrate?.(pattern);
  } catch { /* unsupported */ }
}
