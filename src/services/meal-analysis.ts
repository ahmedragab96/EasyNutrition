import { supabase } from '@/lib/supabase';

export type MealAnalysisResult = {
  name: string;
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
  const { data, error } = await supabase.functions.invoke('analyze-meal', {
    body: {
      imageBase64: input.imageBase64,
      mimeType: input.mimeType ?? 'image/jpeg',
      description: input.description,
    },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);

  return data as MealAnalysisResult;
}
