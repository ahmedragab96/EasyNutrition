import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { analyzeInsights, getMonthInsightsPayload } from '@/services/insights';
import { InsightsResult } from '@/types/nutrition';

type UseInsightsResult = {
  result: InsightsResult | null;
  loading: boolean;
  error: string | null;
  /** ISO timestamp of when this month's analysis was last generated */
  lastAnalysedAt: string | null;
  /** True once the cache check is complete (prevents flash of empty state) */
  cacheReady: boolean;
  analyse: () => Promise<void>;
};

function cacheKey(year: number, month: number): string {
  return `insights_${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Manages AI-generated monthly insights with AsyncStorage caching.
 * Cached per month — re-analysis only on explicit user request.
 */
export function useInsights(year: number, month: number): UseInsightsResult {
  const [result, setResult]               = useState<InsightsResult | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [lastAnalysedAt, setLastAnalysed] = useState<string | null>(null);
  const [cacheReady, setCacheReady]       = useState(false);

  const key = cacheKey(year, month);

  // Load from cache whenever year/month changes
  useEffect(() => {
    setCacheReady(false);
    setResult(null);
    setLastAnalysed(null);
    setError(null);

    SecureStore.getItemAsync(key).then((raw) => {
      if (raw) {
        try {
          const cached = JSON.parse(raw) as { generatedAt: string; data: InsightsResult };
          setResult(cached.data);
          setLastAnalysed(cached.generatedAt);
        } catch {
          // corrupted entry — ignore
        }
      }
      setCacheReady(true);
    });
  }, [key]);

  async function analyse() {
    setLoading(true);
    setError(null);
    try {
      const payload = await getMonthInsightsPayload(year, month);
      const data = await analyzeInsights(payload);
      const generatedAt = new Date().toISOString();
      await SecureStore.setItemAsync(key, JSON.stringify({ generatedAt, data }));
      setResult(data);
      setLastAnalysed(generatedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, lastAnalysedAt, cacheReady, analyse };
}
