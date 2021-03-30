import { fromPairs, isEmpty } from 'lodash/fp';
import { Store } from 'pullstate';

import { OldState, initStoreStorage } from '../storeStorage';

import { PersistentState, initialState } from './initialState';
import { OriginalPersistentState } from './originalTypes';

export const PersistentUserStore = new Store(initialState);

const defaultReconcile = (iState: PersistentState, oldState: OldState) => {
  return fromPairs(Object.entries(iState).map(([key, value]) => [key, oldState[key] || value])) as PersistentState;
};

const reconcileState = (iState: PersistentState, oldState: OldState): PersistentState => {
  if (!isEmpty(oldState) && oldState.lastTimeThisStateChangedTypes === undefined) {
    const reconciled = defaultReconcile(iState, oldState);
    // we're dealing with originalTypes
    const originalTypedState = oldState as OriginalPersistentState;

    return {
      ...reconciled,

      structuresFilesLoaded: originalTypedState.structuresDbMeta?.currentPage || iState.structuresFilesLoaded,
      structuresTotalPages: originalTypedState.structuresDbMeta?.totalPages || iState.structuresTotalPages,

      assignmentsFilesLoaded: originalTypedState.assignmentsDbMeta?.currentPage || iState.assignmentsFilesLoaded,
      assignmentsTotalPages: originalTypedState.assignmentsDbMeta?.totalPages || iState.assignmentsTotalPages,
    };
  }

  return defaultReconcile(iState, oldState);
};

export async function initPersistentStore(userId: number) {
  const { restoreStoredData, subscribe } = initStoreStorage({
    storeName: userId.toString(),
    store: PersistentUserStore,
    initialState,
  });

  await restoreStoredData(reconcileState);

  PersistentUserStore.update((s) => {
    return { ...s, initialized: true };
  });

  return subscribe();
}
