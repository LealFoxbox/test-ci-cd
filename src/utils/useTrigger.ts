import { useCallback, useState } from 'react';

export type ShouldTrigger = number | null;
export type TriggerFn = () => void;
export type ResetTrigger = () => void;

export function useTrigger(): [ShouldTrigger, TriggerFn, ResetTrigger] {
  const [shouldTrigger, setShouldTrigger] = useState<ShouldTrigger>(null);

  return [
    shouldTrigger,
    useCallback(() => {
      setShouldTrigger((s) => (s !== null ? s * -1 : 1));
    }, []),
    useCallback(() => {
      setShouldTrigger(null);
    }, []),
  ];
}
