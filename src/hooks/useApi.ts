import { useState, useCallback } from 'react';

export function useApi<T, P extends any[]>(apiFunc: (...args: P) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (...args: P) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiFunc]);

  return { data, isLoading, error, execute, setData };
}
