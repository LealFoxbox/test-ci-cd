import config from 'src/config';
import { User } from 'src/types';

import { UserSessionStatus } from './persistentStore';

export type State = {
  status: UserSessionStatus;
  userData: User | null;
  isStaging: boolean;
};

export const initialState: State = {
  status: 'starting',
  userData: null,
  isStaging: config.isStaging,
};
