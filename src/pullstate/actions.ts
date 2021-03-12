import { omit, pick } from 'lodash/fp';

import { deleteAllJSONFiles } from 'src/services/downloader/fileUtils';
import { cleanMongo } from 'src/services/mongodb';
import { User } from 'src/types';

import { LoginStore } from './loginStore';
import { initialState as loginInitialState } from './loginStore/initialState';
import { DownloadStore } from './downloadStore';
import { initialState as downloadInitialState } from './downloadStore/initialState';
import { UploadStore } from './uploadStore';
import { initialState as uploadInitialState } from './uploadStore/initialState';
import { PersistentUserStore, initPersistentStore } from './persistentStore';
import { initialState as persistentInitialState } from './persistentStore/initialState';

let persistentStoreUnsub = () => {};

export const loginAction = async (user: User) => {
  persistentStoreUnsub = await initPersistentStore(user.id);

  LoginStore.update((s) => {
    return {
      ...s,
      userData: user,
      status: 'loggedIn',
    };
  });
};

export const logoutAction = async () => {
  await deleteAllJSONFiles();
  await cleanMongo();

  LoginStore.update((s) => {
    return {
      ...loginInitialState,
      isStaging: s.isStaging,
      status: 'shouldLogIn',
    };
  });

  PersistentUserStore.update((s) => {
    return { ...s, ...omit(['drafts', 'pendingUploads', 'uploads'], persistentInitialState) };
  });

  persistentStoreUnsub();

  PersistentUserStore.update(() => persistentInitialState);
  DownloadStore.update(() => downloadInitialState);
  UploadStore.update(() => uploadInitialState);
};

export const toggleStagingAction = () => {
  LoginStore.update((s) => {
    return {
      ...s,
      isStaging: !s.isStaging,
    };
  });
};

export const updateStructuresMeta = (currentPage: number, totalPages: number) => {
  PersistentUserStore.update((s) => {
    return {
      ...s,
      structuresDbMeta: { currentPage, totalPages },
    };
  });
};

export const updateAssignmentsMeta = (currentPage: number, totalPages: number) => {
  PersistentUserStore.update((s) => {
    return {
      ...s,
      assignmentsDbMeta: { currentPage, totalPages },
    };
  });
};

export async function clearInspectionsDataAction() {
  await deleteAllJSONFiles();
  await cleanMongo();

  DownloadStore.update(() => downloadInitialState);

  PersistentUserStore.update((s) => {
    return {
      ...s,
      ...pick(
        ['forms', 'ratings', 'ratingsDownloaded', 'assignmentsDbMeta', 'structuresDbMeta', 'lastUpdated'],
        persistentInitialState,
      ),
    };
  });
}
