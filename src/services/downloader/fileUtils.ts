/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-console */

import RNFS, { ReadDirItem } from 'react-native-fs';
import RNBackgroundDownloader from 'react-native-background-downloader';
import { last, sortBy } from 'lodash/fp';

import { DownloadType } from './backDownloads';

const dir = RNBackgroundDownloader.directories.documents;

export const EXPIRATION_TIME_SPAN = 60 * 60 * 24; // one day in seconds

export interface MetaFile {
  meta: {
    current_page: number;
    total_pages: number;
  };
}

function getNow() {
  return Date.now() * 0.001;
}

export async function deleteAllJSONFiles() {
  const allFiles = await RNFS.readDir(dir);
  const ourFiles = allFiles.filter(
    (f) => f.name.startsWith('structures') || f.name.startsWith('assignments') || f.name.startsWith('ratings'),
  );

  console.log(
    'DELETE FILES:',
    ourFiles.map((f) => f.path),
  );

  return Promise.all(ourFiles.map((f) => RNFS.unlink(f.path)));
}

export function getFileTimestamp(fileName: string) {
  //file name example: 'structures1 - 21_01_05 1609860756.json'
  const timestamp = last(fileName.split(' '));
  if (!timestamp) {
    return null;
  }

  return parseInt(timestamp.replace(/[^0-9]/g, ''), 10);
}

export function getFilePage(fileName: string) {
  //file name example: 'structures1 - 21_01_05 1609860756.json'
  const typeAndPage = fileName.split(' ')[0];
  const page = parseInt(typeAndPage.replace(/[^0-9]/g, ''), 10);

  if (isNaN(page)) {
    return null;
  }

  return page;
}

export function findNextPage(allFiles: ReadDirItem[], type: DownloadType) {
  const sortedFiles = sortBy(
    'name',
    allFiles.filter((f) => f.name.startsWith(type)),
  );

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
  if (!lastDownloaded || getNow() - lastDownloaded >= EXPIRATION_TIME_SPAN) {
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
  const ourSortedFiles = allFiles.filter(
    (f) => f.name.startsWith('structures') || f.name.startsWith('assignments') || f.name.startsWith('ratings'),
  );

  let i = 0;
  while (i < ourSortedFiles.length) {
    const file = ourSortedFiles[i];

    const isValid = await isFileValid(file);
    if (!isValid) {
      await RNFS.unlink(file.path);
    }

    i += 1;
  }
}

export async function findValidFile<T>(type: DownloadType) {
  const fileList = (await RNFS.readDir(dir)).filter((f) => f.name.startsWith(type)).map((f) => f.path);

  let i = 0;
  while (i < fileList.length) {
    try {
      const downloadedContent = JSON.parse(await RNFS.readFile(fileList[i])) as T;
      return downloadedContent;
    } catch (e) {
      i += 1;
    }
  }

  return null;
}
