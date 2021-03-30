import { DraftForm, Form, PendingUpload, Rating } from 'src/types';

// this is a string to use when restoring states to make sure the migration goes as smooth as possible
// we use a descriptive string instead of a version number to improve human readability
// Note: this should only change when the state changes structure, naming or type
export type PersistentStateVersions = undefined | 'dbRefactor';

export type PersistentState = {
  lastTimeThisStateChangedTypes: PersistentStateVersions;

  initialized: boolean;
  forms: Record<string, Form>; // the key is formId
  ratings: Record<string, Rating>; // the key is ratingId
  ratingsDownloaded: null | number;
  structuresFilesLoaded: number;
  structuresFilePaths: Record<string, string>; // key: file name, value: file path
  structuresTotalPages: number;

  assignmentsFilesLoaded: number;
  assignmentsFilePaths: Record<string, string>; // key: file name, value: file path
  assignmentsTotalPages: number;

  lastUpdated: null | number;

  drafts: Record<string, DraftForm>; // the key is assignmentId
  pendingUploads: PendingUpload[];
  uploads: PendingUpload[];
};

export const initialState: PersistentState = {
  lastTimeThisStateChangedTypes: 'dbRefactor',

  initialized: false,
  forms: {},
  ratings: {},
  ratingsDownloaded: null,

  structuresFilesLoaded: 0,
  structuresFilePaths: {},
  structuresTotalPages: 0,

  assignmentsFilesLoaded: 0,
  assignmentsFilePaths: {},
  assignmentsTotalPages: 0,

  lastUpdated: null,
  drafts: {},
  pendingUploads: [],
  uploads: [],
};
