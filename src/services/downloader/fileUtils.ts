/* eslint-disable no-console */
/* eslint-disable import/no-named-as-default-member */

import RNFS, { ReadDirItem } from 'react-native-fs';
import RNBackgroundDownloader from 'react-native-background-downloader';
import { last, sortBy } from 'lodash/fp';

import { isSecondsExpired } from 'src/utils/expiration';

import { DownloadType } from './backDownloads';

const dir = RNBackgroundDownloader.directories.documents;

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
    console.warn('deleteFile function: error ', e, ' for file ', file.path);
  }
}

// NOTE:
// file name structure: {type}{page number} - {date in yy_mm_dd} {timestamp of download in unix seconds}.json
// file name example: 'structures1 - 21_01_05 1609860756.json'
// the date itself is not used but it's there for human readability

export function getOurFiles(allFiles: ReadDirItem[]) {
  return sortBy(
    'name',
    allFiles.filter(
      (f) => f.name.endsWith('.json') && (f.name.startsWith('structures') || f.name.startsWith('assignments')),
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

function getFileTimestamp(fileName: string) {
  const timestamp = last(fileName.split(' '));
  if (!timestamp) {
    return null;
  }

  return parseInt(timestamp.replace(/[^0-9]/g, ''), 10);
}

function isFileExpired(file: ReadDirItem) {
  const lastDownloaded = getFileTimestamp(file.name);

  return isSecondsExpired(lastDownloaded);
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
  if (isFileExpired(file)) {
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

export async function deleteExpiredFiles() {
  const allFiles = await RNFS.readDir(dir);
  const ourFiles = getOurFiles(allFiles);

  if (ourFiles.some(isFileExpired)) {
    for (const file of ourFiles) {
      await deleteFile(file);
    }
    return true;
  }

  return false;
}

export async function deleteInvalidFiles() {
  const allFiles = await RNFS.readDir(dir);
  const ourFiles = getOurFiles(allFiles);
  let foundIt = false;

  for (const file of ourFiles) {
    const isValid = await isFileValid(file);
    if (!isValid) {
      await deleteFile(file);
      foundIt = true;
    }
  }

  return foundIt;
}

export async function findValidFile<T>(type: DownloadType) {
  const allFiles = await RNFS.readDir(dir);

  const filePaths = getOurTypeFiles(allFiles, type).map((f) => f.path);

  for (const path of filePaths) {
    try {
      return JSON.parse(await RNFS.readFile(path)) as T;
    } catch (e) {
      console.log('whoopsie, found an invalid file');
    }
  }

  return null;
}
