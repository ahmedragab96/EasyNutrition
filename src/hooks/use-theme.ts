/**
 * useTheme — returns the flat Colors object (single theme, no light/dark split).
 * Android-only project; always light theme from DESIGN.md.
 */

import { Colors } from '@/constants/theme';

export function useTheme() {
  return Colors;
}
