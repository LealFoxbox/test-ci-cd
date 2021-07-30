import { fromPairs, omit } from 'lodash/fp';
import * as Sentry from '@sentry/react-native';

import { deleteAllJSONFiles } from 'src/services/downloader/fileUtils';
import storage from 'src/pullstate/sensitiveStorage';
import { cleanAsyncStorage, cleanMongo } from 'src/services/mongodb';
import { DraftForm, PendingUpload, User } from 'src/types';
import { fetchtUser } from 'src/services/api/user';
import { axiosCatchTo } from 'src/utils/catchTo';
import { DownloadType } from 'src/services/downloader/backDownloads';
import { logErrorToSentry } from 'src/utils/logger';
import { removeAllStorage } from 'src/services/storage';
import config from 'src/config';

import { LoginStore } from './loginStore';
import { RatesStatus, initialState as loginInitialState } from './loginStore/initialState';
import { DownloadStore } from './downloadStore';
import { initialState as downloadInitialState } from './downloadStore/initialState';
import { UploadStore } from './uploadStore';
import { initialState as uploadInitialState } from './uploadStore/initialState';
import { PersistentUserStore, initPersistentStore } from './persistentStore';
import { initialState as persistentInitialState } from './persistentStore/initialState';

let persistentStoreUnsub = () => {};

export const removeDraftIncorrect = (currentDrafts: Record<string, DraftForm> = {}) => {
  const drafts = Object.values(currentDrafts || {});
  const correctDrafts = drafts.filter((draft) => draft.assignmentId);
  if (correctDrafts.length !== drafts.length) {
    logErrorToSentry('[APP][INFO][CLE-DRA]', {
      severity: Sentry.Severity.Info,
      draft: drafts.filter((draft) => !draft.assignmentId),
    });
  }
  return fromPairs(correctDrafts.map((draft) => [draft.assignmentId, draft])) || {};
};

export const removeUploadsIncorrect = (uploads: PendingUpload[] = []) => {
  return uploads?.filter(({ draft }) => draft?.assignmentId) || [];
};

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

export const rateInitAction = ({ appBuild }: { appBuild: string }) => {
  LoginStore.update((s) => {
    return {
      ...s,
      rates: {
        ...s.rates,
        [appBuild]: {
          inspections: 1,
          status: 'update',
          isCompleted: false,
        },
      },
    };
  });
};

const getRateStatus = (totalInspections: number, isCompleted: boolean): RatesStatus => {
  if (totalInspections < config.AMOUNT_INSPECTIONS_TO_RATE) {
    return 'update';
  }
  if (totalInspections >= config.AMOUNT_INSPECTIONS_TO_RATE && !isCompleted) {
    return 'request';
  }
  if (isCompleted) {
    return 'completed';
  }
  return 'update';
};

export const rateAction = ({ appBuild, isRateCompleted }: { appBuild: string; isRateCompleted: boolean }) => {
  LoginStore.update((s) => {
    const totalInspections = (s?.rates?.[appBuild]?.inspections || 0) + 1;
    return {
      ...s,
      rates: {
        ...s.rates,
        [appBuild]: {
          inspections: totalInspections,
          isCompleted: isRateCompleted,
          status: getRateStatus(totalInspections, isRateCompleted),
        },
      },
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

export const clearAllDataAction = async () => {
  try {
    await removeAllStorage();
    await logoutAction();
    await cleanAsyncStorage();
    await storage.clearAll();
  } catch (error) {
    console.warn('error clear data', error.message);
  }
};

export const toggleStagingAction = () => {
  LoginStore.update((s) => {
    return {
      ...s,
      isStaging: !s.isStaging,
    };
  });
};

export const updateTotalPages = ({
  structuresTotalPages,
  assignmentsTotalPages,
}: {
  structuresTotalPages: number;
  assignmentsTotalPages: number;
}) => {
  PersistentUserStore.update((s) => ({
    ...s,
    structuresTotalPages,
    assignmentsTotalPages,
  }));
};

export const clearFilePaths = (fileNames: string[]) => {
  PersistentUserStore.update((s) => ({
    ...s,
    structuresFilePaths: omit(fileNames, s.structuresFilePaths),
    assignmentsFilePaths: omit(fileNames, s.assignmentsFilePaths),
  }));
};

export const addFilesPaths = ({ type, filePaths }: { type: DownloadType; filePaths: Record<string, string> }) => {
  if (type === 'structures') {
    PersistentUserStore.update((s) => ({
      ...s,
      structuresFilePaths: { ...s.structuresFilePaths, ...filePaths },
    }));
  } else {
    PersistentUserStore.update((s) => ({
      ...s,
      assignmentsFilePaths: { ...s.assignmentsFilePaths, ...filePaths },
    }));
  }
};

export const clearFilesPaths = (type: DownloadType, fileNames: string[]) => {
  if (type === 'structures') {
    PersistentUserStore.update((s) => ({
      ...s,
      structuresFilePaths: omit(fileNames, s.structuresFilePaths),
    }));
  } else {
    PersistentUserStore.update((s) => ({
      ...s,
      assignmentsFilePaths: omit(fileNames, s.assignmentsFilePaths),
    }));
  }
};

export const clearAllFilesPaths = (type: DownloadType) => {
  if (type === 'structures') {
    PersistentUserStore.update((s) => ({
      ...s,
      structuresFilePaths: {},
    }));
  } else {
    PersistentUserStore.update((s) => ({
      ...s,
      assignmentsFilePaths: {},
    }));
  }
};

export const clearDraftsEmpty = () => {
  PersistentUserStore.update((s) => {
    return {
      ...s,
      drafts: removeDraftIncorrect(s.drafts || {}),
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

  PersistentUserStore.update((s) => ({
    ...s,
    ...omit(['initialized', 'drafts', 'pendingUploads', 'uploads'], persistentInitialState),
  }));

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
