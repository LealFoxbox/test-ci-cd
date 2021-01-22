/* eslint-disable import/no-named-as-default-member */

import { MutableRefObject, useEffect, useRef } from 'react';
import RNBackgroundDownloader from 'react-native-background-downloader';
import RNFS from 'react-native-fs';

import { Form } from 'src/types';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import timeoutPromise from 'src/utils/timeoutPromise';
import { useTrigger } from 'src/utils/useTrigger';
import { selectMongoComplete } from 'src/pullstate/selectors';
import { initialState } from 'src/pullstate/persistentStore/initialState';
import { hasConnection, useNetworkStatus } from 'src/utils/useNetworkStatus';

import { fetchForm } from '../api/forms';
import { assignmentsDb, cleanMongo } from '../mongodb';
import { useIsMongoLoaded } from '../mongoHooks';

import { DownloadType, downloadByTypeAsPromise, waitForExistingDownloads } from './backDownloads';
import { refreshDb } from './dbUtils';
import {
  EXPIRATION_SECONDS,
  MetaFile,
  deleteAllJSONFiles,
  deleteInvalidFiles,
  findNextPage,
  findValidFile,
  getUnixSeconds,
} from './fileUtils';

const dir = RNBackgroundDownloader.directories.documents;

const FLAGS = {
  loggedIn: false,
};

interface TotalPages {
  structures: number | null;
  assignments: number | null;
  ratings: number | null;
}

function setProgress(progress: number) {
  DownloadStore.update((s) => {
    if (s.progress !== progress) {
      s.progress = progress;
    }
  });
}

function setDownloading(downloading: 'forms' | 'db' | null) {
  DownloadStore.update((s) => {
    s.downloading = downloading;
  });
}

async function getNextDownload(totalPages: MutableRefObject<TotalPages>) {
  const allFiles = await RNFS.readDir(dir);
  const nextStructuresPage = findNextPage(allFiles, 'structures');

  if (!totalPages.current.structures || nextStructuresPage <= totalPages.current.structures) {
    console.log('getNextDownload: structures ', nextStructuresPage, ' out of ', totalPages.current.structures);

    return {
      type: 'structures' as DownloadType,
      page: nextStructuresPage,
      progress: !totalPages.current.structures
        ? nextStructuresPage * 2
        : (30 * nextStructuresPage) / totalPages.current.structures,
    };
  }

  const nextAssignmentsPage = findNextPage(allFiles, 'assignments');

  if (!totalPages.current.assignments || nextAssignmentsPage <= totalPages.current.assignments) {
    console.log('getNextDownload: assignments ', nextAssignmentsPage, ' out of ', totalPages.current.assignments);
    return {
      type: 'assignments' as DownloadType,
      page: nextAssignmentsPage,
      progress: !totalPages.current.assignments
        ? 30 + nextAssignmentsPage * 2
        : 30 + (30 * nextAssignmentsPage) / totalPages.current.assignments,
    };
  }

  console.log('getNextDownload: ', null);

  return null;
}

async function updateTotalPages(totalPages: MutableRefObject<TotalPages>, type: DownloadType) {
  const validFile = await findValidFile<MetaFile>(type);

  if (validFile) {
    totalPages.current[type] = validFile.meta.total_pages;
    return true;
  }

  return false;
}

async function getMissingForms(forms: Record<string, Form>) {
  const now = getUnixSeconds();
  return (await assignmentsDb.getDistinctFormIds()).filter(
    (id) => !forms[id] || now - forms[id].lastDownloaded >= EXPIRATION_SECONDS,
  );
}

async function fetchForms(formIds: number[], token: string, subdomain: string) {
  console.log('DOWNLOADING FORMS');
  setDownloading('forms');

  let errorsCount = 0;
  let isConnected = true;

  let i = 0;
  while (i < formIds.length && FLAGS.loggedIn && errorsCount < 3 && isConnected) {
    const formId = formIds[i];
    try {
      console.log('fetchForms: form ', i + 1, ' out of ', formIds.length);

      const { data } = await fetchForm({ companyId: subdomain, token, formId });
      errorsCount = 0;
      PersistentUserStore.update((s) => {
        s.forms[data.inspection_form.id] = {
          ...data.inspection_form,
          lastDownloaded: getUnixSeconds(),
        };
      });
      setProgress(70 + (30 * i) / formIds.length);
    } catch (e) {
      errorsCount += 1;
      // we probably don't have any internet, let's check that
      isConnected = await hasConnection();
    }

    await timeoutPromise(200);

    i += 1;
  }

  if (!isConnected) {
    setDownloading(null);
  } else if (errorsCount >= 3) {
    DownloadStore.update((s) => {
      s.error = `Failed to download form data`;
    });
  } else {
    setProgress(100);
    PersistentUserStore.update((s) => {
      s.lastUpdated = Date.now();
    });
  }

  setDownloading(null);
}

export async function dbDownload(token: string, subdomain: string, totalPages: MutableRefObject<TotalPages>) {
  console.log('DOWNLOADING STRUCTURES AND ASSIGNMENTS');
  setDownloading('db');
  await waitForExistingDownloads();
  await deleteInvalidFiles();
  await updateTotalPages(totalPages, 'structures');
  await updateTotalPages(totalPages, 'assignments');
  await updateTotalPages(totalPages, 'ratings');

  let nextDownload = await getNextDownload(totalPages);
  let erroredOut = false;

  while (nextDownload && FLAGS.loggedIn && !erroredOut) {
    if (nextDownload) {
      setProgress(nextDownload.progress);
    }

    try {
      await downloadByTypeAsPromise({ token, subdomain, page: nextDownload.page, type: nextDownload.type });
    } catch (e) {
      console.warn(nextDownload.type, ' error on page ', nextDownload.page, ' with: ', e);
      erroredOut = true;
      DownloadStore.update((s) => {
        s.error = `Failed to download Inspections data`;
        s.downloading = null;
      });
    }

    await timeoutPromise(200);

    if (!totalPages.current[nextDownload.type]) {
      await updateTotalPages(totalPages, nextDownload.type);
    }
    nextDownload = await getNextDownload(totalPages);
  }

  if (!erroredOut) {
    setProgress(60);

    FLAGS.loggedIn && (await refreshDb());

    await deleteAllJSONFiles();

    setProgress(70);

    setDownloading(null);
  }
}

export function useDownloader() {
  const [shouldTrigger, setShouldTrigger] = useTrigger();
  const token = PersistentUserStore.useState((s) => s.userData?.single_access_token);
  const inspectionsEnabled = PersistentUserStore.useState((s) => s.userData?.features.inspection_feature.enabled);
  const subdomain = PersistentUserStore.useState((s) => s.userData?.account.subdomain);
  const forms = PersistentUserStore.useState((s) => s.forms);
  const isMongoComplete = PersistentUserStore.useState(selectMongoComplete);
  const downloading = DownloadStore.useState((s) => s.downloading);
  const downloadError = DownloadStore.useState((s) => s.error);
  const isMongoLoaded = useIsMongoLoaded();
  const connected = useNetworkStatus();

  const totalPages = useRef<TotalPages>({
    structures: null,
    assignments: null,
    ratings: null,
  });

  useEffect(() => {
    (async () => {
      if (!token) {
        FLAGS.loggedIn = false;
      } else if (isMongoLoaded && shouldTrigger && subdomain) {
        FLAGS.loggedIn = true;
        if (inspectionsEnabled && !downloadError && downloading === null) {
          if (!isMongoComplete) {
            void dbDownload(token, subdomain, totalPages);
          } else {
            if (!connected) {
              DownloadStore.update((s) => {
                if (s.progress < 70) {
                  s.progress = 70;
                }
              });
            } else {
              const formIds = await getMissingForms(forms);
              if (formIds.length > 0) {
                void fetchForms(formIds, token, subdomain);
              } else {
                setProgress(100);
              }
            }
          }
        }
      }
    })();
  }, [
    isMongoLoaded,
    shouldTrigger,
    token,
    subdomain,
    forms,
    isMongoComplete,
    downloading,
    inspectionsEnabled,
    downloadError,
    connected,
  ]);

  return setShouldTrigger;
}

export async function clearInspectionsData() {
  await cleanMongo();
  DownloadStore.update((s) => {
    s.progress = 0;
    s.error = null;
  });
  PersistentUserStore.update((s) => {
    s.forms = initialState.forms;
    s.assignmentsDbMeta = initialState.assignmentsDbMeta;
    s.structuresDbMeta = initialState.structuresDbMeta;
  });
}
