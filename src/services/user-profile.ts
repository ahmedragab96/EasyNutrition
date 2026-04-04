import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/nutrition';
import { Database } from '@/lib/database.types';

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];

function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name ?? undefined,
    calorieGoal: row.calorie_goal,
    macroGoals: {
      protein: Number(row.protein_goal),
      carbs: Number(row.carbs_goal),
      fats: Number(row.fats_goal),
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Returns the current user's profile.
 * Returns null if no profile exists yet (pre-onboarding).
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? toUserProfile(data) : null;
}

/**
 * Creates or updates the current user's profile.
 * Safe to call after onboarding or on settings save.
 */
export async function upsertUserProfile(
  input: Partial<{
    displayName: string;
    calorieGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatsGoal: number;
  }>
): Promise<UserProfile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      ...(input.displayName !== undefined && { display_name: input.displayName }),
      ...(input.calorieGoal !== undefined && { calorie_goal: input.calorieGoal }),
      ...(input.proteinGoal !== undefined && { protein_goal: input.proteinGoal }),
      ...(input.carbsGoal !== undefined && { carbs_goal: input.carbsGoal }),
      ...(input.fatsGoal !== undefined && { fats_goal: input.fatsGoal }),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toUserProfile(data);
}
