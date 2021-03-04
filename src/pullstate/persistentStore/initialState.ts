import { DraftForm, Form, PendingUpload, Rating } from 'src/types';

export type PersistentState = {
  initialized: boolean;
  forms: Record<string, Form>; // the key is formId
  ratings: Record<string, Rating>; // the key is ratingId
  ratingsDownloaded: null | number;
  structuresDbMeta: null | {
    currentPage: number;
    totalPages: number;
  };
  assignmentsDbMeta: null | {
    currentPage: number;
    totalPages: number;
  };
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
  structuresDbMeta: null,
  assignmentsDbMeta: null,
  lastUpdated: null,

  drafts: {},
  pendingUploads: [],
  uploads: [],
};
