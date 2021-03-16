import config from 'src/config';
import { User } from 'src/types';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn' | 'logoutTriggered';

export type LoginState = {
  status: UserSessionStatus;
  userData: User | null;
  outdatedUserData: boolean;
  isStaging: boolean;
};

export const initialState: LoginState = {
  status: 'starting',
  userData: null,
  outdatedUserData: false,
  isStaging: config.isDev,
};
