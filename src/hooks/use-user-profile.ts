import { useCallback, useEffect, useState } from 'react';
import { getUserProfile, upsertUserProfile } from '@/services/user-profile';
import { UserProfile } from '@/types/nutrition';

type UpdateInput = Partial<{
  displayName: string;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
}>;

type UseUserProfileResult = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  update: (input: UpdateInput) => Promise<UserProfile>;
  refresh: () => void;
};

/**
 * Reads and writes the current user's nutrition profile.
 * `profile` is null until auth + first load completes, or if onboarding hasn't run.
 */
export function useUserProfile(): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getUserProfile()
      .then((p) => {
        if (!cancelled) {
          setProfile(p);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load profile');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  const update = useCallback(async (input: UpdateInput): Promise<UserProfile> => {
    const updated = await upsertUserProfile(input);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, loading, error, update, refresh };
}
