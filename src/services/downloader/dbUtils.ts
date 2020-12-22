/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-console */

import RNFS from 'react-native-fs';
import RNBackgroundDownloader from 'react-native-background-downloader';

import { FetchAssignmentsResponse } from '../api/assignments';
import { FetchStructuresResponse } from '../api/structures';
import { assignmentsDb, structuresDb } from '../mongodb';

const dir = RNBackgroundDownloader.directories.documents;

export async function refreshDb() {
  const allFiles = await RNFS.readDir(dir);
  const structuresPathList = allFiles.filter((f) => f.name.startsWith('structures')).map((f) => f.path);

  structuresDb.clean();

  let i = 0;
  while (i < structuresPathList.length) {
    try {
      console.log('READING ', structuresPathList[i]);
      const downloadedContent = JSON.parse(await RNFS.readFile(structuresPathList[i])) as FetchStructuresResponse;
      structuresDb.insertPage(downloadedContent.structures);
    } catch (e) {
      console.log('refreshDb structures error: ', e);
    }
    i += 1;
  }

  const assignmentsPathList = allFiles.filter((f) => f.name.startsWith('assignments')).map((f) => f.path);

  assignmentsDb.clean();

  i = 0;
  while (i < assignmentsPathList.length) {
    try {
      console.log('READING ', assignmentsPathList[i]);
      const downloadedContent = JSON.parse(await RNFS.readFile(assignmentsPathList[i])) as FetchAssignmentsResponse;
      assignmentsDb.insertPage(downloadedContent.inspection_form_assignments);
    } catch (e) {
      console.log('refreshDb assignments error: ', e);
    }
    i += 1;
  }
}
