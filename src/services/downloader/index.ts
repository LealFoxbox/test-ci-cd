/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-console */

import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import RNBackgroundDownloader from 'react-native-background-downloader';
import RNFS from 'react-native-fs';

import { Form } from 'src/types';

import { DownloadStore } from '../../pullstate/downloadStore';
import { PersistentUserStore } from '../../pullstate/persistentStore';
import timeoutPromise from '../../utils/timeoutPromise';
import { fetchForm } from '../api/forms';
import { assignmentsDb, isMongoComplete } from '../mongodb';

import { DownloadType, downloadByTypeAsPromise } from './backDownloads';
import { refreshDb } from './dbUtils';
import { EXPIRATION_TIME_SPAN, MetaFile, deleteInvalidFiles, findNextPage, findValidFile } from './fileUtils';

const dir = RNBackgroundDownloader.directories.documents;

interface TotalPages {
  structures: number | null;
  assignments: number | null;
  ratings: number | null;
}

async function getNextDownload(totalPages: MutableRefObject<TotalPages>) {
  const allFiles = await RNFS.readDir(dir);
  const nextStructuresPage = findNextPage(allFiles, 'structures');

  if (!totalPages.current.structures || nextStructuresPage <= totalPages.current.structures) {
    console.warn('getNextDownload: structures ', nextStructuresPage, ' out of ', totalPages.current.structures);

    return {
      type: 'structures' as DownloadType,
      page: nextStructuresPage,
      progress: !totalPages.current.structures
        ? (nextStructuresPage - 1) * 2
        : (40 * nextStructuresPage) / totalPages.current.structures,
    };
  }

  const nextAssignmentsPage = findNextPage(allFiles, 'assignments');

  if (!totalPages.current.assignments || nextAssignmentsPage <= totalPages.current.assignments) {
    console.warn('getNextDownload: assignments ', nextAssignmentsPage, ' out of ', totalPages.current.assignments);
    return {
      type: 'assignments' as DownloadType,
      page: nextAssignmentsPage,
      progress: !totalPages.current.assignments
        ? 40 + (nextAssignmentsPage - 1) * 2
        : 40 + (40 * nextAssignmentsPage) / totalPages.current.assignments,
    };
  }

  console.warn('getNextDownload: ', null);

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

async function fetchForms(forms: Record<string, Form>, token: string, subdomain: string) {
  const now = Date.now();
  const formIds = assignmentsDb
    .getDistinctFormIds()
    .filter((id) => !forms[id] || now - forms[id].lastDownloaded >= EXPIRATION_TIME_SPAN);

  let i = 0;
  while (i < formIds.length) {
    const formId = formIds[i];
    try {
      const { data } = await fetchForm({ companyId: subdomain, token, formId });
      PersistentUserStore.update((s) => {
        s.forms[data.inspection_form.id] = {
          ...data.inspection_form,
          lastDownloaded: Date.now(),
        };
      });
    } catch (e) {
      DownloadStore.update((s) => {
        s.error = `Failed to download form data for ${formId}`;
      });
    }
    await timeoutPromise(10);
    i += 1;
  }
}

export async function downloadInit(
  token: string,
  subdomain: string,
  totalPages: MutableRefObject<TotalPages>,
  forms: Record<string, Form>,
) {
  const backgroundTasks = await RNBackgroundDownloader.checkForExistingDownloads();
  await Promise.all(
    backgroundTasks.map((t) => {
      return new Promise<void>((resolve, reject) => {
        t.done(() => {
          resolve();
        }).error(() => {
          reject();
        });
      });
    }),
  );

  if (backgroundTasks.length > 0) {
    await timeoutPromise(100);
  }

  await deleteInvalidFiles();
  await updateTotalPages(totalPages, 'structures');
  await updateTotalPages(totalPages, 'assignments');
  await updateTotalPages(totalPages, 'ratings');

  let nextDownload = await getNextDownload(totalPages);
  while (nextDownload) {
    DownloadStore.update((s) => {
      // @ts-ignore
      s.progress = nextDownload.progress;
    });

    // TODO: retry on 1 failure to download and exit with error if it doesn't work
    // TODO: check for too much difference between file dates to retrigger a whole download
    await downloadByTypeAsPromise({ token, subdomain, page: nextDownload.page, type: nextDownload.type });
    await timeoutPromise(100);

    if (!totalPages.current[nextDownload.type]) {
      await updateTotalPages(totalPages, nextDownload.type);
    }
    nextDownload = await getNextDownload(totalPages);
  }

  console.log(
    'EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT ',
  );

  /*
  nextTask = await downloadRatingsStep(token, subdomain);
  while (nextTask) {
    nextTask = await downloadRatingsStep(token, subdomain);
  }
*/

  await refreshDb();

  // await deleteAllJSONFiles();

  await fetchForms(forms, token, subdomain);

  DownloadStore.update((s) => {
    s.progress = 100;
    s.error = null;
  });
}

export function useDownloader() {
  const [shouldDownload, setShouldDownload] = useState<number | null>(null);
  const token = PersistentUserStore.useState((s) => s.userData?.single_access_token);
  const subdomain = PersistentUserStore.useState((s) => s.userData?.account.subdomain);
  const forms = PersistentUserStore.useState((s) => s.forms);
  const totalPages = useRef<TotalPages>({
    structures: null,
    assignments: null,
    ratings: null,
  });

  useEffect(() => {
    if (shouldDownload && token && subdomain && !isMongoComplete()) {
      void downloadInit(token, subdomain, totalPages, forms);
    }
  }, [shouldDownload, token, subdomain, forms]);

  return useCallback(() => {
    setShouldDownload((s) => (s ? s + 1 : 1));
  }, []);
}
