import { useState } from 'react';
import { createFoodItem } from '@/services/food-items';
import { logMeal as logMealService } from '@/services/meal-logs';
import { FoodItem, FoodSource, MealLog, MealType } from '@/types/nutrition';

type LogFromExistingInput = {
  foodItem: FoodItem;
  mealType: MealType;
  dateId: string;
  quantity?: number;
  notes?: string;
};

type LogFromScanInput = {
  name: string;
  description?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize?: number;
  servingUnit?: string;
  source?: FoodSource;
  aiConfidence?: number;
  mealType: MealType;
  dateId: string;
  quantity?: number;
};

type UseLogMealResult = {
  /** Log an already-known food item (manual search re-add). */
  logExisting: (input: LogFromExistingInput) => Promise<MealLog>;
  /** Create a new food item from an AI scan then log it. */
  logFromScan: (input: LogFromScanInput) => Promise<MealLog>;
  loading: boolean;
  error: string | null;
};

/**
 * Mutation hook for logging meals.
 * Covers both re-logging existing items and confirming AI scans.
 */
export function useLogMeal(): UseLogMealResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logExisting(input: LogFromExistingInput): Promise<MealLog> {
    setLoading(true);
    setError(null);
    try {
      return await logMealService(input);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to log meal';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function logFromScan(input: LogFromScanInput): Promise<MealLog> {
    setLoading(true);
    setError(null);
    try {
      const foodItem = await createFoodItem({
        name: input.name,
        description: input.description,
        kcal: input.kcal,
        protein: input.protein,
        carbs: input.carbs,
        fats: input.fats,
        servingSize: input.servingSize,
        servingUnit: input.servingUnit,
        aiConfidence: input.aiConfidence,
        source: input.source ?? 'ai_scan',
        mealType: input.mealType,
      });

      return await logMealService({
        foodItem,
        mealType: input.mealType,
        dateId: input.dateId,
        quantity: input.quantity ?? 1,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to log meal';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { logExisting, logFromScan, loading, error };
}
