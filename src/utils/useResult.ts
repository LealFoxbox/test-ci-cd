import { useCallback, useState } from 'react';

export type ShouldTrigger = number | null;
export type TriggerFn = () => void;

export function useResult<T = undefined>(): [T | true | null, (...args: any[]) => void] {
  const [result, setResult] = useState<T | true | null>(null);

  return [
    result,
    useCallback((r: T) => {
      setResult(() => (r === undefined ? true : r));
    }, []),
  ];
}
