/* eslint-disable no-console */
/* eslint-disable import/no-named-as-default-member */

import { MutableRefObject } from 'react';
import RNFS from 'react-native-fs';
import RNBackgroundDownloader from 'react-native-background-downloader';

import { getMockFlags } from 'src/config';
import { updateAssignmentsMeta, updateStructuresMeta } from 'src/pullstate/actions';

import { FetchAssignmentsResponse, mockAssignmentsPage } from '../api/assignments';
import { FetchStructuresResponse, mockStructuresPage } from '../api/structures';
import { assignmentsDb, structuresDb } from '../mongodb';

import { MetaFile, findNextPage, findValidFile, getOurTypeFiles } from './fileUtils';
import { DownloadType } from './backDownloads';
import { PERCENTAGES } from './percentages';

const dir = RNBackgroundDownloader.directories.documents;

export async function refreshDb(isStaging: boolean) {
  const allFiles = await RNFS.readDir(dir);
  const structuresPathList = getOurTypeFiles(allFiles, 'structures').map((f) => f.path);

  await structuresDb.clean();

  let i = 0;
  while (i < structuresPathList.length) {
    try {
      console.log('READING ', structuresPathList[i]);
      const downloadedContent = JSON.parse(await RNFS.readFile(structuresPathList[i])) as FetchStructuresResponse;
      await structuresDb.insertPage(downloadedContent.structures);
      updateStructuresMeta(i + 1, structuresPathList.length);
    } catch (e) {
      console.log('refreshDb structures error: ', e);
    }
    i += 1;
  }

  if (getMockFlags(isStaging).DATA_STRUCTURES) {
    updateStructuresMeta(15.777, structuresPathList.length);
    i = 0;
    while (i < 20) {
      try {
        console.log('MOCKING STRUCTURES ', i);
        await structuresDb.insertPage(mockStructuresPage());
      } catch (e) {
        console.log('refreshDb structures error: ', e);
      }
      i += 1;
    }
    updateStructuresMeta(structuresPathList.length, structuresPathList.length);
  }

  const assignmentsPathList = getOurTypeFiles(allFiles, 'assignments').map((f) => f.path);

  await assignmentsDb.clean();

  i = 0;
  while (i < assignmentsPathList.length) {
    try {
      console.log('READING ', assignmentsPathList[i]);
      const downloadedContent = JSON.parse(await RNFS.readFile(assignmentsPathList[i])) as FetchAssignmentsResponse;
      await assignmentsDb.insertPage(downloadedContent.inspection_form_assignments);
      updateAssignmentsMeta(i + 1, assignmentsPathList.length);
    } catch (e) {
      console.log('refreshDb assignments error: ', e);
    }
    i += 1;
  }

  if (getMockFlags(isStaging).DATA_ASSIGNMENTS) {
    updateAssignmentsMeta(15.777, assignmentsPathList.length);
    i = 0;
    while (i < 20) {
      try {
        console.log('MOCKING ASSIGNMENTS', i);
        await assignmentsDb.insertPage(mockAssignmentsPage());
      } catch (e) {
        console.log('refreshDb assignments error: ', e);
      }
      i += 1;
    }
    updateAssignmentsMeta(assignmentsPathList.length, assignmentsPathList.length);
  }
}

export interface DbTotalPages {
  structures: number | null;
  assignments: number | null;
}

export async function updateDBTotalPages(totalPages: MutableRefObject<DbTotalPages>, type: DownloadType) {
  const validFile = await findValidFile<MetaFile>(type);

  if (validFile) {
    totalPages.current[type] = validFile.meta.total_pages;
    return true;
  }

  return false;
}

export async function getNextDbDownload(totalPages: MutableRefObject<DbTotalPages>) {
  const allFiles = await RNFS.readDir(dir);
  const nextStructuresPage = findNextPage(allFiles, 'structures');

  if (!totalPages.current.structures || nextStructuresPage <= totalPages.current.structures) {
    console.log('getNextDbDownload: structures ', nextStructuresPage, ' out of ', totalPages.current.structures);
    const [start, end] = PERCENTAGES.structures;

    return {
      type: 'structures' as DownloadType,
      page: nextStructuresPage,
      progress: !totalPages.current.structures
        ? start + nextStructuresPage * 2
        : start + ((end - start) * nextStructuresPage) / totalPages.current.structures,
    };
  }

  const nextAssignmentsPage = findNextPage(allFiles, 'assignments');

  if (!totalPages.current.assignments || nextAssignmentsPage <= totalPages.current.assignments) {
    console.log('getNextDbDownload: assignments ', nextAssignmentsPage, ' out of ', totalPages.current.assignments);
    const [start, end] = PERCENTAGES.assignments;

    return {
      type: 'assignments' as DownloadType,
      page: nextAssignmentsPage,
      progress: !totalPages.current.assignments
        ? start + nextAssignmentsPage * 2
        : start + ((end - start) * nextAssignmentsPage) / totalPages.current.assignments,
    };
  }

  console.log('getNextDbDownload: ', null);

  return null;
}
