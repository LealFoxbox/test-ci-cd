/* eslint-disable no-console */
import RNFS from 'react-native-fs';
import { last, uniq } from 'lodash/fp';

import { downloadDir } from 'src/services/storage';
import { isSecondsExpired } from 'src/utils/expiration';
import { PersistentUserStore } from 'src/pullstate/persistentStore';

const dir = downloadDir;

export interface MetaFile {
  meta: {
    current_page: number;
    total_pages: number;
  };
}

export async function deleteFile(filePath: string) {
  try {
    await RNFS.unlink(filePath);
  } catch (e) {
    console.warn('deleteFile function: error ', e, ' for file ', filePath);
  }
}

export function deleteFiles(filePaths: string[]) {
  return Promise.all(filePaths.map(deleteFile));
}

// NOTE:
// file name structure: {type}{page number} - {date in yy_mm_dd} {timestamp of download in unix seconds}.json
// file name example: 'structures1 - 21_01_05 1609860756.json'
// the yy_mm_dd section is only there for human readability

export async function deleteAllJSONFiles() {
  try {
    const rawState = PersistentUserStore.getRawState();

    const dirFiles = await RNFS.readDir(dir);

    const filePaths = uniq(
      dirFiles
        .filter(
          (f) => f.name.endsWith('.json') && (f.name.startsWith('structures') || f.name.startsWith('assignments')),
        )
        .map((f) => f.path)
        .concat(Object.values(rawState.structuresFilePaths))
        .concat(Object.values(rawState.assignmentsFilePaths)),
    );

    console.log('DELETE FILES:', filePaths);

    return deleteFiles(filePaths);
  } catch (error) {
    console.log('error', error.message);
    return [];
  }
}

function getFileTimestamp(fileName: string) {
  const timestamp = last(fileName.split(' '));
  if (!timestamp) {
    return null;
  }

  return parseInt(timestamp.replace(/[^0-9]/g, ''), 10);
}

function isFileExpired(fileName: string) {
  const lastDownloaded = getFileTimestamp(fileName);

  return isSecondsExpired(lastDownloaded);
}

function getFilePage(fileName: string) {
  const typeAndPage = fileName.split(' ')[0];
  const page = parseInt(typeAndPage.replace(/[^0-9]/g, ''), 10);

  if (isNaN(page)) {
    return null;
  }

  return page;
}

export function findNextPage(files: Record<string, string>) {
  const sortedFileNames = Object.keys(files).sort();

  const foundIndex = sortedFileNames.findIndex((f: string, i: number) => {
    return getFilePage(f) !== i + 1;
  });

  if (foundIndex !== -1) {
    return foundIndex + 1;
  }

  return sortedFileNames.length + 1;
}

async function isFileValid(fileName: string, filaPath: string) {
  const page = getFilePage(fileName);

  if (page === null) {
    return false;
  }

  try {
    const fileString = await RNFS.readFile(filaPath);
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

export function areFilesExpired(files: Record<string, string>) {
  return Object.keys(files).some(isFileExpired);
}

export async function deleteInvalidFiles(files: Record<string, string>) {
  const deletedFiles = [];

  for (const [fileName, filePath] of Object.entries(files)) {
    const isValid = await isFileValid(fileName, filePath);
    if (!isValid) {
      await deleteFile(filePath);
      deletedFiles.push(fileName);
    }
  }

  return deletedFiles;
}

export async function findValidFile<T>(files: Record<string, string>) {
  const filePaths = Object.values(files);

  for (const path of filePaths) {
    try {
      return JSON.parse(await RNFS.readFile(path)) as T;
    } catch (e) {
      console.log('whoopsie, found an invalid file');
    }
  }

  return null;
}
