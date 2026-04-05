import { useEffect, useRef, useState } from 'react';
import { getRecentFoodItems, searchFoodItems } from '@/services/food-items';
import { FoodItem } from '@/types/nutrition';

const DEBOUNCE_MS = 300;

export function useFoodSearch(query: string) {
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShowingRecent, setIsShowingRecent] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      // Empty query — load recent items
      setLoading(true);
      setIsShowingRecent(true);
      getRecentFoodItems(20)
        .then((items) => {
          setResults(items);
          setError(null);
        })
        .catch((e) => {
          setError(e instanceof Error ? e.message : 'Failed to load recent items');
          setResults([]);
        })
        .finally(() => setLoading(false));
      return;
    }

    // Typed query — debounced search
    setIsShowingRecent(false);
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const items = await searchFoodItems(query);
        setResults(items);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, loading, error, isShowingRecent };
}
