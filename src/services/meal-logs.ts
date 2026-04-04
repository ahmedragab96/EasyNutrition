import { supabase } from '@/lib/supabase';
import { FoodItem, MealLog, MealType } from '@/types/nutrition';
import { Database } from '@/lib/database.types';

type MealLogRow = Database['public']['Tables']['meal_logs']['Row'];

function toMealLog(row: MealLogRow): MealLog {
  return {
    id: row.id,
    userId: row.user_id,
    foodItemId: row.food_item_id,
    mealType: row.meal_type as MealType,
    dateId: row.date_id,
    loggedAt: row.logged_at,
    quantity: Number(row.quantity),
    snapshot: {
      kcal: row.kcal_snapshot,
      protein: Number(row.protein_snapshot),
      carbs: Number(row.carbs_snapshot),
      fats: Number(row.fats_snapshot),
    },
    notes: row.notes ?? undefined,
  };
}

/**
 * All meal logs for the current user on a given date (YYYY-MM-DD).
 * Returns logs ordered by logged_at ascending.
 */
export async function getMealLogsForDate(dateId: string): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('date_id', dateId)
    .order('logged_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toMealLog);
}

/**
 * Returns total kcal consumed per day for a given month.
 * Result: Record<'YYYY-MM-DD', totalKcal>
 */
export async function getMonthCalorieSums(
  year: number,
  month: number
): Promise<Record<string, number>> {
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0);
  const lastDayStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('meal_logs')
    .select('date_id, kcal_snapshot, quantity')
    .gte('date_id', firstDay)
    .lte('date_id', lastDayStr);

  if (error) throw new Error(error.message);

  const sums: Record<string, number> = {};
  for (const row of data ?? []) {
    const key = row.date_id;
    sums[key] = (sums[key] ?? 0) + row.kcal_snapshot * Number(row.quantity);
  }
  return sums;
}

/**
 * Logs a food item for the current user.
 * Computes snapshots from the food item × quantity.
 */
export async function logMeal(input: {
  foodItem: FoodItem;
  mealType: MealType;
  dateId: string;
  quantity?: number;
  notes?: string;
}): Promise<MealLog> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const qty = input.quantity ?? 1;
  const { foodItem, mealType, dateId, notes } = input;

  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: user.id,
      food_item_id: foodItem.id,
      meal_type: mealType,
      date_id: dateId,
      quantity: qty,
      kcal_snapshot: Math.round(foodItem.kcal * qty),
      protein_snapshot: foodItem.macros.protein * qty,
      carbs_snapshot: foodItem.macros.carbs * qty,
      fats_snapshot: foodItem.macros.fats * qty,
      notes: notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toMealLog(data);
}

/**
 * Deletes a meal log entry.
 */
export async function deleteMealLog(id: string): Promise<void> {
  const { error } = await supabase.from('meal_logs').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
