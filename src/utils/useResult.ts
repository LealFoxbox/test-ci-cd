import { useCallback, useEffect, useState } from 'react';

export type ShouldTrigger = number | null;
export type TriggerFn = () => void;

export function useResult<T>() {
  const [result, setResult] = useState<T | true | null>(null);

  return [
    result,
    useCallback((r?: T) => {
      setResult(() => (r === undefined ? true : r));
    }, []),
  ] as const;
}

export function useResultAsync<T = unknown>(fn: () => Promise<T>, shouldTrigger: boolean) {
  const [state, setState] = useState<{ result: T | null; loading: boolean; error: string }>({
    result: null,
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (shouldTrigger) {
      let mounted = true;
      setState((s) => ({ ...s, loading: true }));

      void fn()
        .then((r) => {
          if (mounted) {
            setState({ result: r, loading: false, error: '' });
          }
        })
        .catch((e: string | { message: string }) => {
          try {
            setState((s) => ({
              ...s,
              loading: false,
              error: (typeof e === 'string' ? e : e?.message || e?.toString()) || 'Error',
            }));
          } catch (error) {
            setState((s) => ({ ...s, loading: false, error: 'some unparseable error has ocurred' }));
          }
        });

      return () => {
        mounted = false;
      };
    }
    return;
  }, [fn, shouldTrigger]);

  return [state.result, state.loading, state.error] as const;
}
