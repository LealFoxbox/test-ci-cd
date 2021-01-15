/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Store } from 'pullstate';

import storage from './sensitiveStorage';

const watchFilter = <S>(a: S) => a;

export function initStoreStorage<S>(storeName: string, store: Store<S>) {
  return {
    init: async () => {
      const localStorageValue = await storage.getItem(storeName);
      const parsedValue = JSON.parse(localStorageValue != null ? localStorageValue : '{}') as S;

      store.update((s) => {
        for (const [key, value] of Object.entries(parsedValue)) {
          // @ts-ignore
          s[key] = value;
        }
      });

      return parsedValue;
    },
    subscribe: () => {
      return store.subscribe(watchFilter, (keepLocal) => {
        void storage.setItem(storeName, JSON.stringify(keepLocal));
      });
    },
  };
}
