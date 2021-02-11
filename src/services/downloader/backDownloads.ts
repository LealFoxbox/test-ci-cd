import { checkForExistingDownloads, directories, download } from 'react-native-background-downloader';
import { format } from 'date-fns';

import timeoutPromise from 'src/utils/timeoutPromise';

import { getApiUrl } from '../api/utils';

const dir = directories.documents;

// note: timestamp t is unix time but in full seconds
function getNow() {
  return format(new Date(), 'yy_MM_dd t');
}

export type DownloadType = 'assignments' | 'structures';

export function downloadStructuresPage(params: { subdomain: string; token: string; page: number }) {
  const type = 'structures';
  const id = `${type}${params.page} - ${getNow()}`;

  return download({
    id,
    url: `${getApiUrl(params.subdomain)}/downloads/structures?user_credentials=${params.token}&page=${params.page}`,
    destination: `${dir}/${id}.json`,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  });
}

export function downloadAssignmentsPage(params: { subdomain: string; token: string; page: number }) {
  const type = 'assignments';
  const id = `${type}${params.page} - ${getNow()}`;

  return download({
    id,
    url: `${getApiUrl(params.subdomain)}/downloads/inspection_form_assignments?user_credentials=${params.token}&page=${
      params.page
    }`,
    destination: `${dir}/${id}.json`,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  });
}

export function downloadRatings(params: { subdomain: string; token: string }) {
  const type = 'ratings';
  const id = `${type} - ${getNow()}`;

  return download({
    id,
    url: `${getApiUrl(params.subdomain)}/downloads/ratings?user_credentials=${params.token}`,
    destination: `${dir}/${id}.json`,
    headers: {
      Accept: 'application/json',
      'cache-control': 'no-cache',
    },
  });
}

export function downloadByType(params: { type: DownloadType; subdomain: string; token: string; page: number }) {
  switch (params.type) {
    case 'structures':
      return downloadStructuresPage(params);
    case 'assignments':
      return downloadAssignmentsPage(params);
  }
}

export function downloadByTypeAsPromise(params: {
  type: DownloadType;
  subdomain: string;
  token: string;
  page: number;
}) {
  return new Promise<void>((resolve, reject) => {
    return downloadByType(params)
      .begin((expectedBytes) => {
        console.log(`${params.type} - Going to download ${expectedBytes} bytes!`);
      })
      .done(() => {
        console.log(`${params.type} - Download is done!`);
        resolve();
      })
      .error((error) => {
        console.log(`${params.type} - Download canceled due to error: `, error);
        reject(error);
      });
  });
}

export async function waitForExistingDownloads() {
  const backgroundTasks = await checkForExistingDownloads();
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
    // wait for json files to be written to file, just in case
    // TODO: test if this was necessary
    await timeoutPromise(200);
  }

  return backgroundTasks;
}
