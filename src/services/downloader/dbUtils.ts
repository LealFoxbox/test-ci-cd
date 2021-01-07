/* eslint-disable import/no-named-as-default-member */
/* eslint-disable no-console */

import RNFS from 'react-native-fs';
import RNBackgroundDownloader from 'react-native-background-downloader';

import { updateAssignmentsMeta, updateStructuresMeta } from 'src/pullstate/persistentStore';

import { FetchAssignmentsResponse } from '../api/assignments';
import { FetchStructuresResponse } from '../api/structures';
import { assignmentsDb, structuresDb } from '../mongodb';

import { getOurTypeFiles } from './fileUtils';

const dir = RNBackgroundDownloader.directories.documents;

export async function refreshDb() {
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
}
