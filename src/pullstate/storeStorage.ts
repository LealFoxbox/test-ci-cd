import { Store } from 'pullstate';

import storage from './sensitiveStorage';

const watchFilter = <S>(a: S) => a;

export function initStoreStorage<S>({
  storeName,
  store,
  initialState,
}: {
  storeName: string;
  store: Store<S>;
  initialState: S;
}) {
  return {
    restoreStoredData: async () => {
      const localStorageValue = await storage.getItem(storeName);
      const parsedValue = JSON.parse(localStorageValue != null ? localStorageValue : '{}') as S;

      store.update(() => ({ ...initialState, ...parsedValue }));

      return parsedValue;
    },
    subscribe: () => {
      return store.subscribe(watchFilter, (keepLocal) => {
        void storage.setItem(storeName, JSON.stringify(keepLocal));
      });
    },
  };
}
