import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { FoodItem, FoodSource, MealType } from '@/types/nutrition';

type FoodItemRow = Database['public']['Tables']['food_items']['Row'];
type FoodItemInsert = Database['public']['Tables']['food_items']['Insert'];

function toFoodItem(row: FoodItemRow): FoodItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    kcal: row.kcal,
    macros: {
      protein: Number(row.protein),
      carbs: Number(row.carbs),
      fats: Number(row.fats),
    },
    servingSize: row.serving_size ?? undefined,
    servingUnit: row.serving_unit ?? undefined,
    isCountable: row.is_countable,
    category: row.category ?? undefined,
    source: row.source as FoodSource,
    aiConfidence: row.ai_confidence ?? undefined,
    createdBy: row.created_by ?? undefined,
    isPublic: row.is_public,
    createdAt: row.created_at,
  };
}

/**
 * Fetches system food items (created_by IS NULL), excluding any IDs already shown.
 * Used to pad the empty-query list when the user has fewer than `limit` recent items.
 */
export async function getSystemFoodItems(
  limit: number,
  excludeIds: string[] = [],
): Promise<FoodItem[]> {
  let query = supabase
    .from('food_items')
    .select('*')
    .is('created_by', null)
    .order('name', { ascending: true })
    .limit(limit);

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(toFoodItem);
}

/**
 * Returns the most recently logged distinct food items for the current user.
 * Used in Add screen manual mode when the search bar is empty.
 */
export async function getRecentFoodItems(limit = 20): Promise<FoodItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get the most recently logged food_item_ids for this user (distinct, ordered by last logged)
  const { data: logData, error: logError } = await supabase
    .from('meal_logs')
    .select('food_item_id, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(limit * 3); // fetch extra to account for duplicates

  if (logError || !logData?.length) return [];

  // Deduplicate — keep first occurrence (most recent) of each food_item_id
  const seen = new Set<string>();
  const recentIds: string[] = [];
  for (const row of logData) {
    if (!seen.has(row.food_item_id)) {
      seen.add(row.food_item_id);
      recentIds.push(row.food_item_id);
      if (recentIds.length === limit) break;
    }
  }

  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .in('id', recentIds);

  if (error) throw new Error(error.message);

  // Re-sort to match the recency order from meal_logs
  const itemMap = new Map((data ?? []).map((r) => [r.id, r]));
  return recentIds.map((id) => itemMap.get(id)).filter(Boolean).map(toFoodItem);
}

/**
 * Full-text search across food items the user owns + all public/system items.
 * Used in Add screen manual mode.
 */
export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .textSearch('name', query, { type: 'plain', config: 'english' })
    .limit(30);

  if (error) throw new Error(error.message);
  return (data ?? []).map(toFoodItem);
}

/**
 * Creates a new food item record (called before logging an AI-scanned meal).
 */
export async function createFoodItem(
  input: {
    name: string;
    description?: string;
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    servingSize?: number;
    servingUnit?: string;
    isCountable?: boolean;
    category?: string;
    source?: FoodSource;
    aiConfidence?: number;
    mealType?: MealType;
  }
): Promise<FoodItem> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertedItem: FoodItemInsert = {
    name: input.name,
    description: input.description,
    kcal: input.kcal,
    protein: input.protein,
    carbs: input.carbs,
    fats: input.fats,
    serving_size: input.servingSize,
    serving_unit: input.servingUnit,
    is_countable: input.isCountable ?? false,
    category: input.category ?? input.mealType ?? null,
    source: input.source ?? 'manual_search',
    ai_confidence: input.aiConfidence,
    created_by: user?.id ?? null,
    is_public: true,
  };

  const { data, error } = await supabase
    .from('food_items')
    .insert(insertedItem)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toFoodItem(data);
}

/**
 * Fetches a single food item by ID.
 */
export async function getFoodItem(id: string): Promise<FoodItem> {
  const { data, error } = await supabase
    .from('food_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return toFoodItem(data);
}
