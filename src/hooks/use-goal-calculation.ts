import { useCallback, useState } from 'react';

import {
  calculateGoals,
  GoalInput,
  GoalResult,
} from '@/services/goal-calculation';

type UseGoalCalculation = {
  calculate: (input: GoalInput) => Promise<void>;
  result: GoalResult | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
};

export function useGoalCalculation(): UseGoalCalculation {
  const [result, setResult] = useState<GoalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = useCallback(async (input: GoalInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await calculateGoals(input);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to calculate goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { calculate, result, loading, error, reset };
}
