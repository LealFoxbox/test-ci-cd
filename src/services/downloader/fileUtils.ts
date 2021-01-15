/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-console */

import RNFS, { ReadDirItem } from 'react-native-fs';
import RNBackgroundDownloader from 'react-native-background-downloader';
import { last, sortBy } from 'lodash/fp';

import { DownloadType } from './backDownloads';

const dir = RNBackgroundDownloader.directories.documents;

export const EXPIRATION_SECONDS = 60 * 60 * 24; // one day in seconds

export interface MetaFile {
  meta: {
    current_page: number;
    total_pages: number;
  };
}

async function deleteFile(file: ReadDirItem) {
  try {
    await RNFS.unlink(file.path);
  } catch (e) {
    console.warn('delete error ', e, ' for file ', file.path);
  }
}

export function getUnixSeconds() {
  return Date.now() * 0.001;
}
// NOTE:
// file name structure: {type}{page number} - {date in yy_mm_dd} {timestamp of download in unix seconds}.json
// file name example: 'structures1 - 21_01_05 1609860756.json'
// the date itself is not used but it's there for human readability

export function getOurFiles(allFiles: ReadDirItem[]) {
  return sortBy(
    'name',
    allFiles.filter(
      (f) =>
        f.name.endsWith('.json') &&
        (f.name.startsWith('structures') || f.name.startsWith('assignments') || f.name.startsWith('ratings')),
    ),
  );
}

export function getOurTypeFiles(allFiles: ReadDirItem[], type: DownloadType) {
  return sortBy(
    'name',
    allFiles.filter((f) => f.name.endsWith('.json') && f.name.startsWith(type)),
  );
}

export async function deleteAllJSONFiles() {
  const allFiles = await RNFS.readDir(dir);
  const ourFiles = getOurFiles(allFiles);

  console.log(
    'DELETE FILES:',
    ourFiles.map((f) => f.path),
  );

  return Promise.all(ourFiles.map(deleteFile));
}

export function getFileTimestamp(fileName: string) {
  const timestamp = last(fileName.split(' '));
  if (!timestamp) {
    return null;
  }

  return parseInt(timestamp.replace(/[^0-9]/g, ''), 10);
}

export function getFilePage(fileName: string) {
  const typeAndPage = fileName.split(' ')[0];
  const page = parseInt(typeAndPage.replace(/[^0-9]/g, ''), 10);

  if (isNaN(page)) {
    return null;
  }

  return page;
}

export function findNextPage(allFiles: ReadDirItem[], type: DownloadType) {
  const sortedFiles = getOurTypeFiles(allFiles, type);

  const foundIndex = sortedFiles.findIndex((f: ReadDirItem, i: number) => {
    return getFilePage(f.name) !== i + 1;
  });

  if (foundIndex !== -1) {
    return foundIndex + 1;
  }

  return sortedFiles.length + 1;
}

async function isFileValid(file: ReadDirItem) {
  const lastDownloaded = getFileTimestamp(file.name);
  if (!lastDownloaded || getUnixSeconds() - lastDownloaded >= EXPIRATION_SECONDS) {
    return false;
  }

  const page = getFilePage(file.name);

  if (page === null) {
    return false;
  }

  try {
    const fileString = await RNFS.readFile(file.path);
    const content = JSON.parse(fileString) as MetaFile;

    if (content.meta && content.meta.current_page && content.meta.total_pages) {
      return content.meta.current_page <= content.meta.total_pages;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
}

export async function deleteInvalidFiles() {
  const allFiles = await RNFS.readDir(dir);
  const ourFiles = getOurFiles(allFiles);

  let i = 0;
  while (i < ourFiles.length) {
    const file = ourFiles[i];

    const isValid = await isFileValid(file);
    if (!isValid) {
      await deleteFile(file);
    }

    i += 1;
  }
}

export async function findValidFile<T>(type: DownloadType) {
  const allFiles = await RNFS.readDir(dir);

  const fileList = getOurTypeFiles(allFiles, type).map((f) => f.path);

  let i = 0;
  while (i < fileList.length) {
    try {
      return JSON.parse(await RNFS.readFile(fileList[i])) as T;
    } catch (e) {
      i += 1;
    }
  }

  return null;
}
