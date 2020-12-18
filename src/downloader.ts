/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-console */
import { useEffect, useRef } from 'react';
import Datastore from 'react-native-local-mongodb';
import AsyncStorage from '@react-native-community/async-storage';
import RNBackgroundDownloader from 'react-native-background-downloader';
import RNFS from 'react-native-fs';

import { getApiUrl } from './services/utils';
import { DownloadStore } from './pullstate/downloadStore';
import { PersistentUserStore } from './pullstate/persistentStore';
import timeoutPromise from './utils/timeoutPromise';

const dir = RNBackgroundDownloader.directories.documents;

const db = new Datastore({ filename: 'asyncStorageKey', storage: AsyncStorage });
// @ts-ignore
db.loadDatabase(function (err: Error | null) {
  if (err) {
    console.warn('database load error', JSON.stringify(err));
  }
});

function downloadStructuresPage(params: { subdomain: string; token: string; page: number }) {
  const type = 'structures';
  return RNBackgroundDownloader.download({
    id: `${type}${params.page}`,
    url: `${getApiUrl(params.subdomain)}/downloads/structures?user_credentials=${params.token}&page=${params.page}`,
    destination: `${dir}/${type}${params.page}.json`,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  });
}

function downloadAssignmentsPage(params: { subdomain: string; token: string; page: number }) {
  const type = 'assignments';
  return RNBackgroundDownloader.download({
    id: `${type}${params.page}`,
    url: `${getApiUrl(params.subdomain)}/downloads/inspection_form_assignments?user_credentials=${params.token}&page=${
      params.page
    }`,
    destination: `${dir}/${type}${params.page}.json`,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  });
}

function downloadRatingsPage(params: { subdomain: string; token: string; page: number }) {
  const type = 'ratings';
  return RNBackgroundDownloader.download({
    id: `${type}${params.page}`,
    url: `${getApiUrl(params.subdomain)}/downloads/ratings?user_credentials=${params.token}&page=${params.page}`,
    destination: `${dir}/${type}${params.page}.json`,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  });
}

/*
const doc = {
  hello: 'world',
  n: 5,
  today: new Date(),
  'react-native-local-mongodbIsAwesome': true,
  notthere: null,
  notToBeSaved: undefined, // Will not be saved,
  fruits: ['apple', 'orange', 'pear'],
  infos: { name: 'react-native-local-mongodb' },
};

db.insert(doc, function (err, newDoc) {
  // Callback is optional
  // newDoc is the newly inserted document, including its _id
  // newDoc has no key called notToBeSaved since its value was undefined

  console.warn('database insert ... error? ', JSON.stringify(err), 'and newDoc: ', JSON.stringify(newDoc));
});

db.find({ hello: 'world' }, function (err: Error | null, docs: Array<typeof doc>) {
  console.warn('database find ... error? ', JSON.stringify(err), 'and docs: ', JSON.stringify(docs));
});

const endpoints = {
  structures: fetchStructures,
  ratings: fetchRatings,
  assignments: fetchAssignments,
};
 */

interface NextDownload {
  type: 'assignments' | 'structures' | 'ratings';
  page: number;
}

export function isMongoComplete() {
  return false;
}

export function fetchDownload(type: string, params: { subdomain: string; token: string; page: number }) {
  switch (type) {
    case 'structures':
      return downloadStructuresPage(params);
    case 'assignments':
      return downloadAssignmentsPage(params);
    case 'ratings':
      return downloadRatingsPage(params);
    default:
      throw Error(`fetchDownload received unknown type ${type}`);
  }
}

function downloadPageStep(token: string, subdomain: string, { page, type }: NextDownload, totalPages: number | null) {
  return new Promise<void>((resolve, reject) => {
    return fetchDownload(type, {
      page,
      token,
      subdomain,
    })
      .begin((expectedBytes) => {
        console.warn(`${type} - Going to download ${expectedBytes} bytes!`);
      })
      .done(() => {
        console.warn(`${type} - Download is done!`);

        if (!totalPages) {
          DownloadStore.update((s) => {
            s.progress += 5;
          });
        } else {
          DownloadStore.update((s) => {
            s.progress += 15 / (totalPages - 1);
          });
        }
        resolve();
      })
      .error((error) => {
        console.warn(`${type} - Download canceled due to error: `, error);
        reject(error);
      });
  });
}

async function deleteAllJSONFiles() {
  const allFiles = await RNFS.readDir(dir);
  const ourFiles = allFiles.filter(
    (f) => f.name.startsWith('structures') || f.name.startsWith('assignments') || f.name.startsWith('ratings'),
  );

  console.warn(
    'DELETE FILES:',
    ourFiles.map((f) => f.path),
  );

  return Promise.all(ourFiles.map((f) => RNFS.unlink(f.path)));
}

async function getNextDownload(totalPages: TotalPages) {
  const nextStructuresPage = (await RNFS.readDir(dir)).filter((f) => f.name.startsWith('structures')).length + 1;

  console.warn('getNextDownload has totalPages: ', totalPages);

  if (!totalPages.structures || nextStructuresPage <= totalPages.structures) {
    return { type: 'structures', page: nextStructuresPage } as NextDownload;
  }

  const nextAssignmentsPage = (await RNFS.readDir(dir)).filter((f) => f.name.startsWith('assignments')).length + 1;

  if (!totalPages.assignments || nextAssignmentsPage <= totalPages.assignments) {
    return { type: 'assignments', page: nextAssignmentsPage } as NextDownload;
  }

  return null;
}

interface TotalPages {
  structures: number | null;
  assignments: number | null;
  ratings: number | null;
}

async function downloadStep(token: string, subdomain: string, totalPages: TotalPages) {
  if (isMongoComplete()) {
    return;
  }

  await deleteAllJSONFiles();

  let nextDownload = await getNextDownload(totalPages);
  while (nextDownload) {
    await downloadPageStep(token, subdomain, nextDownload, totalPages[nextDownload.type]);
    await timeoutPromise(250);

    if (nextDownload.page === 1) {
      const downloadedContent = JSON.parse(await RNFS.readFile(`${dir}/${nextDownload.type}1.json`)) as {
        meta: {
          current_page: number;
          total_pages: number;
        };
      };

      totalPages[nextDownload.type] = downloadedContent.meta.total_pages;
    }

    nextDownload = await getNextDownload(totalPages);
  }

  console.warn(
    'EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT EXIT ',
  );

  /*
  nextTask = await downloadRatingsStep(token, subdomain);
  while (nextTask) {
    nextTask = await downloadRatingsStep(token, subdomain);
  }
*/

  // TODO:
  // CHECK DB STATE
  // LOAD INTO DB
  // SET PROGRESS to 100%

  return deleteAllJSONFiles();
}

export function useDownloader() {
  const token = PersistentUserStore.useState((s) => s.userData?.single_access_token);
  const subdomain = PersistentUserStore.useState((s) => s.userData?.account.subdomain);
  const totalPages = useRef<TotalPages>({
    structures: null,
    assignments: null,
    ratings: null,
  });

  useEffect(() => {
    if (token && subdomain) {
      void downloadStep(token, subdomain, totalPages.current);
    }
  }, [token, subdomain]);
}
