import { useCallback, useEffect, useState } from 'react';
import { getMealLogsForDate } from '@/services/meal-logs';
import { getUserProfile } from '@/services/user-profile';
import { getFoodItem } from '@/services/food-items';
import { DailySummary, Meal, MealLog, UserProfile } from '@/types/nutrition';

const DEFAULT_GOALS: Pick<UserProfile, 'calorieGoal' | 'macroGoals'> = {
  calorieGoal: 2000,
  macroGoals: { protein: 150, carbs: 250, fats: 65 },
};

type DayLogResult = {
  meals: Meal[];
  summary: DailySummary;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

/**
 * Loads all meal logs for a given date and computes a DailySummary.
 * Falls back to default goals when no profile exists.
 */
export function useDayLog(dateId: string): DayLogResult {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [summary, setSummary] = useState<DailySummary>({
    caloriesConsumed: 0,
    caloriesGoal: DEFAULT_GOALS.calorieGoal,
    caloriesBurned: 0,
    macros: {
      protein: { consumed: 0, goal: DEFAULT_GOALS.macroGoals.protein },
      carbs: { consumed: 0, goal: DEFAULT_GOALS.macroGoals.carbs },
      fats: { consumed: 0, goal: DEFAULT_GOALS.macroGoals.fats },
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const [logs, profile] = await Promise.all([
          getMealLogsForDate(dateId),
          getUserProfile(),
        ]);

        if (cancelled) return;

        const goals = profile ?? DEFAULT_GOALS;

        // Enrich logs with food item data (batched)
        const foodData = await enrichWithFoodData(logs);
        if (cancelled) return;

        const enrichedMeals = logs.map((log, i) => logToMeal(log, foodData[i]));
        const computed = computeSummary(logs, goals);

        setMeals(enrichedMeals);
        setSummary(computed);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dateId, tick]);

  return { meals, summary, loading, error, refresh };
}

type FoodData = { name: string; description?: string };

async function enrichWithFoodData(logs: MealLog[]): Promise<FoodData[]> {
  return Promise.all(
    logs.map((log) =>
      getFoodItem(log.foodItemId)
        .then((f) => ({ name: f.name, description: f.description }))
        .catch(() => ({ name: 'Unknown food', description: undefined }))
    )
  );
}

function logToMeal(log: MealLog, food: FoodData): Meal {
  const time = new Date(log.loggedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return {
    id: log.id,
    name: food.name,
    description: food.description,
    time,
    type: log.mealType,
    kcal: log.snapshot.kcal,
    macros: {
      protein: log.snapshot.protein,
      carbs: log.snapshot.carbs,
      fats: log.snapshot.fats,
    },
  };
}

function computeSummary(
  logs: MealLog[],
  goals: Pick<UserProfile, 'calorieGoal' | 'macroGoals'>
): DailySummary {
  const totals = logs.reduce(
    (acc, log) => ({
      kcal: acc.kcal + log.snapshot.kcal,
      protein: acc.protein + log.snapshot.protein,
      carbs: acc.carbs + log.snapshot.carbs,
      fats: acc.fats + log.snapshot.fats,
    }),
    { kcal: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return {
    caloriesConsumed: totals.kcal,
    caloriesGoal: goals.calorieGoal,
    caloriesBurned: 0, // exercise tracking is out of scope for now
    macros: {
      protein: { consumed: totals.protein, goal: goals.macroGoals.protein },
      carbs: { consumed: totals.carbs, goal: goals.macroGoals.carbs },
      fats: { consumed: totals.fats, goal: goals.macroGoals.fats },
    },
  };
}
