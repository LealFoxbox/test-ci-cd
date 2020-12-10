import { User } from 'src/types';

import { initialState } from './persistentInitialState';
import { PersistentUserStore } from './persistentStore';

export const loginAction = (user: User) => {
  PersistentUserStore.update((s) => {
    s.status = 'loggedIn';
    s.userData = user;
  });
};

export const logoutAction = () => {
  PersistentUserStore.update((s) => {
    for (const key of Object.keys(s)) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      s[key] = initialState[key];
    }
    s.status = 'shouldLogIn';
  });
};

export const setStagingAction = (isStaging: boolean) => {
  PersistentUserStore.update((s) => {
    s.isStaging = isStaging;
  });
};
