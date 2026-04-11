import { supabase } from '@/lib/supabase';

export type MealAnalysisResult = {
  name: string;
  /** Ingredient breakdown, e.g. "200g chicken breast, 150g rice, 50g broccoli" */
  description?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  confidence: number;
};

type AnalyzeInput = {
  imageBase64: string;
  mimeType?: string;
  description?: string;
};

/**
 * Sends a food photo to the analyze-meal Edge Function.
 * The Edge Function calls Claude Sonnet 4.6 (vision) and returns
 * structured nutrition facts for the visible portion.
 */
export async function analyzeMealPhoto(input: AnalyzeInput): Promise<MealAnalysisResult> {
  // Explicitly attach session JWT — supabase-js-react-native can miss it
  // when the project uses ES256 JWTs (verify_jwt: false + manual auth on the function).
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase.functions.invoke('analyze-meal', {
    body: {
      imageBase64: input.imageBase64,
      mimeType: input.mimeType ?? 'image/jpeg',
      description: input.description,
    },
    headers: session
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);

  return data as MealAnalysisResult;
}
