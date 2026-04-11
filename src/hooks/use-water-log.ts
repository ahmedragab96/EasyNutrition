import { useCallback, useEffect, useState } from 'react';

import { getWaterForDate, setWaterForDate } from '@/services/water-logs';

type UseWaterLogResult = {
  waterMl: number;
  loading: boolean;
  error: string | null;
  update: (ml: number) => Promise<void>;
};

export function useWaterLog(dateId: string): UseWaterLogResult {
  const [waterMl, setWaterMl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getWaterForDate(dateId)
      .then((ml) => {
        if (!cancelled) {
          setWaterMl(ml);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load water log');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [dateId]);

  const update = useCallback(
    async (ml: number) => {
      setWaterMl(ml); // optimistic update
      try {
        await setWaterForDate(dateId, ml);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save water log');
      }
    },
    [dateId],
  );

  return { waterMl, loading, error, update };
}
