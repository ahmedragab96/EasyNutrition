import { supabase } from '@/lib/supabase';
import { InsightsPayload, InsightsResult } from '@/types/nutrition';
import { getUserProfile } from './user-profile';
import { getWaterForMonth } from './water-logs';

const DEFAULT_GOALS = { kcal: 2000, protein: 150, carbs: 250, fats: 65, waterMl: 2000 };

/**
 * Aggregates a month's meal logs + user goals into a compact payload
 * suitable for the analyze-insights Edge Function.
 */
export async function getMonthInsightsPayload(
  year: number,
  month: number,
): Promise<InsightsPayload> {
  const mm = String(month).padStart(2, '0');
  const firstDay = `${year}-${mm}-01`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const lastDay = `${year}-${mm}-${String(daysInMonth).padStart(2, '0')}`;

  const [profile, logsResult, waterByDate] = await Promise.all([
    getUserProfile(),
    supabase
      .from('meal_logs')
      .select('date_id, kcal_snapshot, protein_snapshot, carbs_snapshot, fats_snapshot, food_item_id')
      .gte('date_id', firstDay)
      .lte('date_id', lastDay),
    getWaterForMonth(year, month),
  ]);

  if (logsResult.error) throw new Error(logsResult.error.message);

  const goals = profile
    ? {
      kcal: profile.calorieGoal,
      protein: profile.macroGoals.protein,
      carbs: profile.macroGoals.carbs,
      fats: profile.macroGoals.fats,
      waterMl: 2000,
    }
    : DEFAULT_GOALS;

  // Aggregate by date
  const dayMap = new Map<string, {
    kcal: number; protein: number; carbs: number; fats: number; mealsCount: number;
  }>();
  const foodItemIds = new Set<string>();

  for (const row of logsResult.data ?? []) {
    const prev = dayMap.get(row.date_id) ?? { kcal: 0, protein: 0, carbs: 0, fats: 0, mealsCount: 0 };
    dayMap.set(row.date_id, {
      kcal: Math.round(prev.kcal + row.kcal_snapshot),
      protein: Math.round((prev.protein + Number(row.protein_snapshot)) * 10) / 10,
      carbs: Math.round((prev.carbs + Number(row.carbs_snapshot)) * 10) / 10,
      fats: Math.round((prev.fats + Number(row.fats_snapshot)) * 10) / 10,
      mealsCount: prev.mealsCount + 1,
    });
    foodItemIds.add(row.food_item_id);
  }

  // Fetch distinct food names (up to 30)
  let topFoods: string[] = [];
  if (foodItemIds.size > 0) {
    const { data: foodRows } = await supabase
      .from('food_items')
      .select('name')
      .in('id', [...foodItemIds])
      .limit(30);
    topFoods = (foodRows ?? []).map((r) => r.name);
  }

  const days = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ date, ...data, waterMl: waterByDate[date] ?? 0 }));

  return {
    goals,
    daysInMonth,
    daysLogged: days.length,
    days,
    topFoods,
    month: `${year}-${mm}`,
  };
}

/**
 * Calls the analyze-insights Edge Function with the aggregated payload.
 */
export async function analyzeInsights(payload: InsightsPayload): Promise<InsightsResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase.functions.invoke('analyze-insights', {
    body: payload,
    headers: session
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);

  return data as InsightsResult;
}
