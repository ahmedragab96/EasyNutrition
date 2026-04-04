import { supabase } from '@/lib/supabase';
import { FoodItem, FoodSource, MealType } from '@/types/nutrition';
import { Database } from '@/lib/database.types';

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
    category: row.category ?? undefined,
    source: row.source as FoodSource,
    aiConfidence: row.ai_confidence ?? undefined,
    createdBy: row.created_by ?? undefined,
    isPublic: row.is_public,
    createdAt: row.created_at,
  };
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
    category?: string;
    source?: FoodSource;
    aiConfidence?: number;
    mealType?: MealType;
  }
): Promise<FoodItem> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insert: FoodItemInsert = {
    name: input.name,
    description: input.description,
    kcal: input.kcal,
    protein: input.protein,
    carbs: input.carbs,
    fats: input.fats,
    serving_size: input.servingSize,
    serving_unit: input.servingUnit,
    category: input.category ?? input.mealType ?? null,
    source: input.source ?? 'manual_search',
    ai_confidence: input.aiConfidence,
    created_by: user?.id ?? null,
    is_public: false,
  };

  const { data, error } = await supabase
    .from('food_items')
    .insert(insert)
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
