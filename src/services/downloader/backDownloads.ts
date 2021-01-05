/* eslint-disable import/no-named-as-default-member */
import RNBackgroundDownloader from 'react-native-background-downloader';
import { format } from 'date-fns';

import { getApiUrl } from '../api/utils';

const dir = RNBackgroundDownloader.directories.documents;

// note: timestamp t is unix time but in full seconds
function getNow() {
  return format(new Date(), 'yy_MM_dd t');
}

export type DownloadType = 'assignments' | 'structures' | 'ratings';

export function downloadStructuresPage(params: { subdomain: string; token: string; page: number }) {
  const type = 'structures';
  const id = `${type}${params.page} - ${getNow()}`;

  return RNBackgroundDownloader.download({
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

  return RNBackgroundDownloader.download({
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

export function downloadRatingsPage(params: { subdomain: string; token: string; page: number }) {
  const type = 'ratings';
  const id = `${type}${params.page} - ${getNow()}`;

  return RNBackgroundDownloader.download({
    id,
    url: `${getApiUrl(params.subdomain)}/downloads/ratings?user_credentials=${params.token}&page=${params.page}`,
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
    case 'ratings':
      return downloadRatingsPage(params);
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
