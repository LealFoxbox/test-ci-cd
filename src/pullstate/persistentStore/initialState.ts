import config from 'src/config';
import { User } from 'src/types';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn' | 'logoutTriggered';

export interface Query {
  doneTimeStamp: number | null; // should be null if progress is < 100
  progress: number;
  payload: null | unknown; // can be present while progress is < 100
}

function createQuery(): Query {
  return {
    doneTimeStamp: null,
    progress: 0,
    payload: null,
  };
}

export type PersistentState = {
  status: UserSessionStatus;
  userData: User | null;
  isStaging: boolean;
  structure: Query;
  forms: Query;
  ratings: Query;
};

export const initialState: PersistentState = {
  status: 'starting',
  userData: null,
  isStaging: config.isStaging,
  structure: createQuery(),
  forms: createQuery(),
  ratings: createQuery(),
};
