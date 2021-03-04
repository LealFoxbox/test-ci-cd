import config from 'src/config';
import { User } from 'src/types';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn' | 'logoutTriggered';

export type LoginState = {
  status: UserSessionStatus;
  userData: User | null;
  isStaging: boolean;
};

export const initialState: LoginState = {
  status: 'starting',
  userData: null,
  isStaging: config.isDev,
};
