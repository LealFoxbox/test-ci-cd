import { useCallback, useState } from 'react';

export type ShouldTrigger = number | null;
export type TriggerFn = () => void;

export function useTrigger(): [ShouldTrigger, TriggerFn] {
  const [shouldTrigger, setShouldTrigger] = useState<ShouldTrigger>(null);

  return [
    shouldTrigger,
    useCallback(() => {
      setShouldTrigger((s) => (s !== null ? s * -1 : 1));
    }, []),
  ];
}
