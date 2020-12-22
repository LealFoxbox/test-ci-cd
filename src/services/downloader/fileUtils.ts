/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-console */

import RNFS from 'react-native-fs';
import RNBackgroundDownloader from 'react-native-background-downloader';

import { DownloadType } from './backDownloads';

const dir = RNBackgroundDownloader.directories.documents;

export interface MetaFile {
  meta: {
    current_page: number;
    total_pages: number;
  };
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

async function isFileValidEmpty(filePath: string) {
  try {
    const fileString = await RNFS.readFile(filePath);
    const content = JSON.parse(fileString) as MetaFile;

    if (content.meta && content.meta.current_page && content.meta.total_pages) {
      return content.meta.current_page > content.meta.total_pages;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export async function deleteEmptyFiles() {
  const allFiles = await RNFS.readDir(dir);
  const ourSortedFiles = allFiles
    .filter((f) => f.name.startsWith('structures') || f.name.startsWith('assignments') || f.name.startsWith('ratings'))
    .sort((f, f2) => parseInt(f.size, 10) - parseInt(f2.size, 10));

  let i = 0;
  while (i < ourSortedFiles.length) {
    const file = ourSortedFiles[i];

    const isEmpty = await isFileValidEmpty(file.path);
    if (isEmpty === true) {
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
