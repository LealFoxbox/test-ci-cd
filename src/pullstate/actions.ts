import { omit, pick } from 'lodash/fp';

import { deleteAllJSONFiles } from 'src/services/downloader/fileUtils';
import { cleanMongo } from 'src/services/mongodb';
import { User } from 'src/types';
import { fetchtUser } from 'src/services/api/user';
import { axiosCatchTo } from 'src/utils/catchTo';

import { LoginStore } from './loginStore';
import { initialState as loginInitialState } from './loginStore/initialState';
import { DownloadStore } from './downloadStore';
import { initialState as downloadInitialState } from './downloadStore/initialState';
import { UploadStore } from './uploadStore';
import { initialState as uploadInitialState } from './uploadStore/initialState';
import { PersistentUserStore, initPersistentStore } from './persistentStore';
import { initialState as persistentInitialState } from './persistentStore/initialState';

let persistentStoreUnsub = () => {};

export const loginAction = async ({ user, outdatedUserData }: { user: User; outdatedUserData?: boolean }) => {
  persistentStoreUnsub = await initPersistentStore(user.id);

  LoginStore.update((s) => {
    const newOutDatedUserData = typeof outdatedUserData === 'boolean' ? outdatedUserData : !!s.outdatedUserData;

    return {
      ...s,
      userData: user,
      status: 'loggedIn',
      outdatedUserData: newOutDatedUserData,
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

export async function clearInspectionsDataAction({
  invalidateUserData,
  companyId,
  token,
}: {
  invalidateUserData?: boolean;
  companyId?: string;
  token?: string;
}) {
  if (invalidateUserData) {
    LoginStore.update((s) => ({ ...s, outdatedUserData: true }));
  }

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

  if (invalidateUserData) {
    // refetch user
    const [error, response] = await axiosCatchTo(() =>
      fetchtUser({
        companyId: companyId || '',
        token: token || '',
      }),
    );

    if (error || !response) {
      DownloadStore.update((s) => ({
        ...s,
        error: error?.toString() || 'There was an error rechecking your permissions',
      }));
    } else {
      LoginStore.update((s) => ({
        ...s,
        userData: response.data.user,
        outdatedUserData: false,
      }));
    }
  }
}
