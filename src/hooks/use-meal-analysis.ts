import { useState } from 'react';
import { analyzeMealPhoto, type MealAnalysisResult } from '@/services/meal-analysis';

type AnalyzeInput = {
  imageBase64: string;
  mimeType?: string;
  description?: string;
};

type UseMealAnalysisResult = {
  analyze: (input: AnalyzeInput) => Promise<MealAnalysisResult>;
  result: MealAnalysisResult | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
};

/**
 * Wraps the meal analysis service with React state.
 * Call `analyze()` with a base64 image to get nutrition facts from Claude.
 */
export function useMealAnalysis(): UseMealAnalysisResult {
  const [result, setResult] = useState<MealAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(input: AnalyzeInput): Promise<MealAnalysisResult> {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeMealPhoto(input);
      setResult(data);
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Analysis failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { analyze, result, loading, error, reset };
}
