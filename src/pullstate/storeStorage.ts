import { Store } from 'pullstate';

import storage from './sensitiveStorage';

const watchFilter = <S>(a: S) => a;

export type OldState = Record<string, unknown>;
export type ReconcileFn<T> = (initialState: T, oldState: OldState) => T;

// TODO: check if there's a better way to specify S has to have lastTimeThisStateChangedTypes

export function initStoreStorage<S = { lastTimeThisStateChangedTypes?: string }>({
  storeName,
  store,
  initialState,
}: {
  storeName: string;
  store: Store<S>;
  initialState: S & { lastTimeThisStateChangedTypes?: string };
}) {
  return {
    restoreStoredData: async (reconcileFn: ReconcileFn<S>) => {
      const localStorageValue = await storage.getItem(storeName);
      const oldState = JSON.parse(localStorageValue != null ? localStorageValue : '{}') as Record<string, unknown>;
      const reconciledState = {
        ...reconcileFn(initialState, oldState),
        lastTimeThisStateChangedTypes: initialState.lastTimeThisStateChangedTypes,
      } as S;

      store.update(() => reconciledState);

      await storage.setItem(storeName, JSON.stringify(reconciledState));

      return reconciledState;
    },
    subscribe: () => {
      return store.subscribe(watchFilter, (keepLocal) => {
        void storage.setItem(storeName, JSON.stringify(keepLocal));
      });
    },
  };
}
