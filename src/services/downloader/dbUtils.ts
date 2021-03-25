/* eslint-disable no-console */

import RNFS from 'react-native-fs';

import { PersistentUserStore } from 'src/pullstate/persistentStore';

import { FetchAssignmentsResponse } from '../api/assignments';
import { FetchStructuresResponse } from '../api/structures';
import { assignmentsDb, structuresDb } from '../mongodb';

import { MetaFile, findNextPage, findValidFile } from './fileUtils';
import { DownloadType } from './backDownloads';
import { PERCENTAGES } from './percentages';

export async function refreshDb(structuresFiles: Record<string, string>, assignmentsFiles: Record<string, string>) {
  const structuresPathList = Object.values(structuresFiles);

  await structuresDb.clean();

  let i = 0;
  while (i < structuresPathList.length) {
    try {
      console.log('READING ', structuresPathList[i]);
      const downloadedContent = JSON.parse(await RNFS.readFile(structuresPathList[i])) as FetchStructuresResponse;
      await structuresDb.insertPage(downloadedContent.structures);

      PersistentUserStore.update((s) => ({
        ...s,
        structuresFilesLoaded: i + 1,
      }));
    } catch (e) {
      console.warn('refreshDb structures error: ', e);
    }
    i += 1;
  }

  const assignmentsPathList = Object.values(assignmentsFiles);

  await assignmentsDb.clean();

  i = 0;
  while (i < assignmentsPathList.length) {
    try {
      console.log('READING ', assignmentsPathList[i]);
      const downloadedContent = JSON.parse(await RNFS.readFile(assignmentsPathList[i])) as FetchAssignmentsResponse;
      await assignmentsDb.insertPage(downloadedContent.inspection_form_assignments);
      PersistentUserStore.update((s) => ({
        ...s,
        assignmentsFilesLoaded: i + 1,
      }));
    } catch (e) {
      console.warn('refreshDb assignments error: ', e);
    }
    i += 1;
  }
}

export interface DbTotalPages {
  structuresTotalPages: number;
  assignmentsTotalPages: number;
}

export async function findTotalPages(files: Record<string, string>) {
  const validFile = await findValidFile<MetaFile>(files);

  if (validFile) {
    return validFile.meta.total_pages;
  }

  return null;
}

export function getNextDbDownload(
  structuresFiles: Record<string, string>,
  assignmentsFiles: Record<string, string>,
  { structuresTotalPages, assignmentsTotalPages }: DbTotalPages,
) {
  const nextStructuresPage = findNextPage(structuresFiles);

  if (!structuresTotalPages || nextStructuresPage <= structuresTotalPages) {
    console.log('getNextDbDownload: structures ', nextStructuresPage, ' out of ', structuresTotalPages);
    const [start, end] = PERCENTAGES.structures;

    return {
      type: 'structures' as DownloadType,
      page: nextStructuresPage,
      progress: !structuresTotalPages
        ? start + nextStructuresPage * 2
        : start + ((end - start) * nextStructuresPage) / structuresTotalPages,
    };
  }

  const nextAssignmentsPage = findNextPage(assignmentsFiles);

  if (!assignmentsTotalPages || nextAssignmentsPage <= assignmentsTotalPages) {
    console.log('getNextDbDownload: assignments ', nextAssignmentsPage, ' out of ', assignmentsTotalPages);
    const [start, end] = PERCENTAGES.assignments;

    return {
      type: 'assignments' as DownloadType,
      page: nextAssignmentsPage,
      progress: !assignmentsTotalPages
        ? start + nextAssignmentsPage * 2
        : start + ((end - start) * nextAssignmentsPage) / assignmentsTotalPages,
    };
  }

  console.log('getNextDbDownload: ', null);

  return null;
}
