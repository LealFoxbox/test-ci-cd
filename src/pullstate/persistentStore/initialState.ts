import { DraftForm, Form, PendingUpload, Rating } from 'src/types';

export type PersistentState = {
  initialized: boolean;
  forms: Record<string, Form>; // the key is formId
  ratings: Record<string, Rating>; // the key is ratingId
  ratingsDownloaded: null | number;
  structuresFilesLoaded: number;
  structuresFilePaths: Record<string, string>; // key: file name, value: complete file path
  structuresTotalPages: number;

  assignmentsFilesLoaded: number;
  assignmentsFilePaths: Record<string, string>; // key: file name, value: complete file path
  assignmentsTotalPages: number;

  lastUpdated: null | number;

  drafts: Record<string, DraftForm>; // the key is assignmentId
  pendingUploads: PendingUpload[];
  uploads: PendingUpload[];
};

export const initialState: PersistentState = {
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
