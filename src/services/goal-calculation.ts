import { supabase } from '@/lib/supabase';

export type GoalInput = {
  gender: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extra_active';
  goal: 'lose' | 'maintain' | 'gain';
  /** 0 for maintain; positive kg amount for lose/gain */
  targetWeightDeltaKg: number;
  /**
   * Gain: lean_bulk | balanced_gain | aggressive_bulk
   * Lose: gradual_cut | moderate_cut | aggressive_cut
   * Maintain: maintain
   */
  goalApproach: string;
  /** Resistance / strength training frequency */
  resistanceTraining: 'none' | 'light' | 'moderate' | 'high';
};

export type GoalResult = {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  /** One-sentence AI rationale shown on the result card */
  reasoning: string;
};

export async function calculateGoals(input: GoalInput): Promise<GoalResult> {
  // Explicitly attach the session JWT — supabase-js-react-native can miss it
  // when SecureStore hasn't finished hydrating the auth state.
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase.functions.invoke('calculate-goals', {
    body: input,
    headers: session
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as GoalResult;
}
