import { MealType } from '@/types/nutrition';

export type Mode = 'camera' | 'barcode' | 'manual';

export const CATEGORY_ICON: Record<string, string> = {
  Breakfast: '🌅',
  Lunch: '🌞',
  Dinner: '🌙',
  Snack: '🍎',
};

export const MEAL_TYPE_OPTIONS: { type: MealType; label: string; icon: string }[] = [
  { type: 'BREAKFAST', label: 'Breakfast', icon: '🌅' },
  { type: 'LUNCH',     label: 'Lunch',     icon: '🌞' },
  { type: 'DINNER',    label: 'Dinner',    icon: '🌙' },
  { type: 'SNACK',     label: 'Snack',     icon: '🍎' },
];

export function getTodayDateId(): string {
  const d = new Date();
  return dateToDateId(d);
}

export function dateToDateId(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dateIdToDate(dateId: string): Date {
  const [y, m, d] = dateId.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Human-readable label for a dateId relative to today. */
export function dateIdLabel(dateId: string): string {
  const today = getTodayDateId();
  if (dateId === today) return 'Today';

  const yesterday = dateToDateId(new Date(Date.now() - 86_400_000));
  if (dateId === yesterday) return 'Yesterday';

  const d = dateIdToDate(dateId);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
