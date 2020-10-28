import React, { Dispatch, useEffect, useReducer } from 'react';

import storage from 'src/utils/sensitiveStorage';
import { User } from 'src/types';
import { fetchtUser } from 'src/services/api';
import { getConfigPromise, setEnv } from 'src/config';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn';
type State = {
  status: UserSessionStatus;
  data: User | null;
};
type Action = {
  type: 'login' | 'logout';
  payload?: UserSessionStatus | User;
};

export const initialState: State = {
  status: 'starting',
  data: null,
};

export const UserSessionContext = React.createContext<[State, Dispatch<Action>] | undefined>(undefined);

async function refetchUser(dispatch: React.Dispatch<Action>, user: User) {
  const response = await fetchtUser({
    companyId: user.account.subdomain,
    token: user.single_access_token,
  });

  if (response.data) {
    dispatch({ type: 'login', payload: response.data.user });
  } else {
    dispatch({ type: 'logout' });
  }
}

export function userSessionReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'login':
      return { ...state, status: 'loggedIn', data: action.payload as User };

    case 'logout':
      return { ...state, status: 'shouldLogIn', data: null };
  }
}

export const UserSessionProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(userSessionReducer, initialState);

  // TODO: review this chain of promises
  useEffect(() => {
    (async () => {
      if (state.status === 'starting') {
        try {
          await getConfigPromise;
        } catch (e) {
          console.error(e);
        } finally {
          try {
            const userString = await storage.getItem('user');
            const user = JSON.parse(userString || 'null') as User;

            if (!user) {
              dispatch({ type: 'logout' });
            } else {
              const isStagingString = await storage.getItem('isStaging');
              setEnv(JSON.parse(isStagingString || 'false') as boolean);

              await refetchUser(dispatch, user);
            }
          } catch (e) {
            dispatch({ type: 'logout' });
          }
        }
      }
    })();
  }, [state]);

  return <UserSessionContext.Provider value={[state, dispatch]}>{children}</UserSessionContext.Provider>;
};

export function useUserSession() {
  const userSession = React.useContext(UserSessionContext);
  if (userSession === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return userSession;
}
