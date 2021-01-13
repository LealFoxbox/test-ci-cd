/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-console */

import { MutableRefObject, useEffect, useRef } from 'react';
import RNBackgroundDownloader from 'react-native-background-downloader';
import RNFS from 'react-native-fs';

import { Form } from 'src/types';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import timeoutPromise from 'src/utils/timeoutPromise';
import { useTrigger } from 'src/utils/useTrigger';
import config from 'src/config';
import { selectMongoComplete } from 'src/pullstate/selectors';

import { fetchForm } from '../api/forms';
import { assignmentsDb } from '../mongodb';
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

function setDownloading(downloading: 'forms' | 'mongo' | null) {
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

  let i = 0;
  while (i < formIds.length && FLAGS.loggedIn) {
    const formId = formIds[i];
    try {
      console.log('fetchForms: form ', i + 1, ' out of ', formIds.length);

      const { data } = await fetchForm({ companyId: subdomain, token, formId });
      PersistentUserStore.update((s) => {
        s.forms[data.inspection_form.id] = {
          ...data.inspection_form,
          lastDownloaded: getUnixSeconds(),
        };
      });
      setProgress(70 + (30 * i) / formIds.length);
    } catch (e) {
      DownloadStore.update((s) => {
        s.error = `Failed to download form data for ${formId}`;
      });
    }
    await timeoutPromise(10);
    i += 1;
  }

  if (config.MOCKS.DOWNLOAD_FORMS) {
    setProgress(70.707);
    i = 0;
    while (i < config.MOCK_LIMITS.MAX_FORMS && FLAGS.loggedIn) {
      console.log('fetchForms: mock form ', i + 1, ' out of ', config.MOCK_LIMITS.MAX_FORMS);
      const formId = formIds[i % formIds.length];
      try {
        const { data } = await fetchForm({ companyId: subdomain, token, formId });
        PersistentUserStore.update((s) => {
          s.forms[data.inspection_form.id] = {
            ...data.inspection_form,
            lastDownloaded: getUnixSeconds(),
          };
        });
        setProgress(70 + (30 * i) / config.MOCK_LIMITS.MAX_FORMS);
      } catch (e) {
        DownloadStore.update((s) => {
          s.error = `Failed to download form data for ${formId}`;
        });
      }
      await timeoutPromise(10);
      i += 1;
    }
  }

  setProgress(100);
  setDownloading(null);
  PersistentUserStore.update((s) => {
    s.lastUpdated = Date.now();
  });
}

export async function mongoDownload(token: string, subdomain: string, totalPages: MutableRefObject<TotalPages>) {
  console.log('DOWNLOADING MONGO');
  setDownloading('mongo');
  await waitForExistingDownloads();
  await deleteInvalidFiles();
  await updateTotalPages(totalPages, 'structures');
  await updateTotalPages(totalPages, 'assignments');
  await updateTotalPages(totalPages, 'ratings');

  let nextDownload = await getNextDownload(totalPages);
  while (nextDownload && FLAGS.loggedIn) {
    if (nextDownload) {
      setProgress(nextDownload.progress);
    }

    // TODO: retry on 1 failure to download and exit with error if it doesn't work
    await downloadByTypeAsPromise({ token, subdomain, page: nextDownload.page, type: nextDownload.type });
    await timeoutPromise(100);

    if (!totalPages.current[nextDownload.type]) {
      await updateTotalPages(totalPages, nextDownload.type);
    }
    nextDownload = await getNextDownload(totalPages);
  }

  setProgress(60);

  FLAGS.loggedIn && (await refreshDb());

  await deleteAllJSONFiles();

  setProgress(70);

  setDownloading(null);

  PersistentUserStore.update((s) => {
    s.lastUpdated = Date.now();
  });
}

export function useDownloader() {
  const [shouldTrigger, setShouldTrigger] = useTrigger();
  const token = PersistentUserStore.useState((s) => s.userData?.single_access_token);
  const subdomain = PersistentUserStore.useState((s) => s.userData?.account.subdomain);
  const forms = PersistentUserStore.useState((s) => s.forms);
  const isMongoComplete = PersistentUserStore.useState(selectMongoComplete);
  const downloading = DownloadStore.useState((s) => s.downloading);
  const isMongoLoaded = useIsMongoLoaded();

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
        if (downloading === null) {
          if (!isMongoComplete) {
            void mongoDownload(token, subdomain, totalPages);
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
    })();
  }, [isMongoLoaded, shouldTrigger, token, subdomain, forms, isMongoComplete, downloading]);

  return setShouldTrigger;
}
