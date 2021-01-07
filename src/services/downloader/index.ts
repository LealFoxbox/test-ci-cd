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

import { fetchForm } from '../api/forms';
import { assignmentsDb, selectMongoComplete } from '../mongodb';

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
  const now = getUnixSeconds();
  const formIds = (await assignmentsDb.getDistinctFormIds()).filter(
    (id) => !forms[id] || now - forms[id].lastDownloaded >= EXPIRATION_SECONDS,
  );

  let i = 0;
  while (i < formIds.length) {
    const formId = formIds[i];
    try {
      const { data } = await fetchForm({ companyId: subdomain, token, formId });
      PersistentUserStore.update((s) => {
        s.forms[data.inspection_form.id] = {
          ...data.inspection_form,
          lastDownloaded: now,
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

function setProgress(progress: number) {
  DownloadStore.update((s) => {
    s.progress = progress;
  });
}

export async function downloadInit(
  token: string,
  subdomain: string,
  totalPages: MutableRefObject<TotalPages>,
  forms: Record<string, Form>,
) {
  await waitForExistingDownloads();
  await deleteInvalidFiles();
  await updateTotalPages(totalPages, 'structures');
  await updateTotalPages(totalPages, 'assignments');
  await updateTotalPages(totalPages, 'ratings');

  let nextDownload = await getNextDownload(totalPages);
  while (nextDownload) {
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

  setProgress(80);

  await refreshDb();

  await deleteAllJSONFiles();

  setProgress(90);

  await fetchForms(forms, token, subdomain);

  DownloadStore.update((s) => {
    s.progress = 100;
    s.error = null;
  });
}

export function useDownloader() {
  const [shouldTrigger, setShouldTrigger] = useTrigger();
  const token = PersistentUserStore.useState((s) => s.userData?.single_access_token);
  const subdomain = PersistentUserStore.useState((s) => s.userData?.account.subdomain);
  const forms = PersistentUserStore.useState((s) => s.forms);
  const isMongoComplete = PersistentUserStore.useState(selectMongoComplete);
  const totalPages = useRef<TotalPages>({
    structures: null,
    assignments: null,
    ratings: null,
  });

  useEffect(() => {
    if (shouldTrigger && token && subdomain && !isMongoComplete) {
      void downloadInit(token, subdomain, totalPages, forms);
    }
  }, [shouldTrigger, token, subdomain, forms, isMongoComplete]);

  return setShouldTrigger;
}
