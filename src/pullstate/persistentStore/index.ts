import { Store } from 'pullstate';

import { initStoreStorage } from '../storeStorage';

import { initialState } from './initialState';

export const PersistentUserStore = new Store(initialState);

export async function initPersistentStore(userId: number) {
  const { restoreStoredData, subscribe } = initStoreStorage({
    storeName: userId.toString(),
    store: PersistentUserStore,
    initialState,
  });

  await restoreStoredData();

  PersistentUserStore.update((s) => {
    return { ...s, initialized: true };
  });

  return subscribe();
}
