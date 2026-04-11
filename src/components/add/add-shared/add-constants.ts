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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
