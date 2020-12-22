import config from 'src/config';
import { Form, User } from 'src/types';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn' | 'logoutTriggered';

export type PersistentState = {
  status: UserSessionStatus;
  userData: User | null;
  isStaging: boolean;
  forms: Record<string, Form>;
};

export const initialState: PersistentState = {
  status: 'starting',
  userData: null,
  isStaging: config.isStaging,
  forms: {},
};
