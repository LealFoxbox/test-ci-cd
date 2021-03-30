import config from 'src/config';
import { User } from 'src/types';

// this is a string to use when restoring states to make sure the migration goes as smooth as possible
// we use a descriptive string instead of a version number to improve human readability
// Note: this should only change when the state changes structure, naming or type
export type LoginStateVersions = undefined | 'outdatedUserDataFlag';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn' | 'logoutTriggered';

export type LoginState = {
  lastTimeThisStateChangedTypes: LoginStateVersions;
  status: UserSessionStatus;
  userData: User | null;
  outdatedUserData: boolean;
  isStaging: boolean;
};

export const initialState: LoginState = {
  lastTimeThisStateChangedTypes: 'outdatedUserDataFlag',
  status: 'starting',
  userData: null,
  outdatedUserData: false,
  isStaging: config.isDev,
};
