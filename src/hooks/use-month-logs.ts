import { useCallback, useEffect, useState } from 'react';
import { getMonthCalorieSums } from '@/services/meal-logs';

type MonthLogsResult = {
  /** Map of 'YYYY-MM-DD' → total kcal consumed that day */
  calorieSums: Record<string, number>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

/**
 * Fetches total kcal per day for a given month.
 * Used by the calendar grid to colour DayRing cells.
 */
export function useMonthLogs(year: number, month: number): MonthLogsResult {
  const [calorieSums, setCalorieSums] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMonthCalorieSums(year, month)
      .then((sums) => {
        if (!cancelled) {
          setCalorieSums(sums);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [year, month, tick]);

  return { calorieSums, loading, error, refresh };
}
