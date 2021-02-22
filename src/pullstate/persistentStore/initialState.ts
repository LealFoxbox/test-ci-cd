import config from 'src/config';
import { DraftForm, Form, PendingUpload, Rating, User } from 'src/types';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn' | 'logoutTriggered';

export type PersistentState = {
  status: UserSessionStatus;
  userData: User | null;
  isStaging: boolean;
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
  uploads: DraftForm[];
};

export const initialState: PersistentState = {
  status: 'starting',
  userData: null,
  isStaging: config.isStaging,
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
