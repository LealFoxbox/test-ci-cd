import React, { Dispatch, useEffect, useReducer } from 'react';

import storage from 'src/utils/sensitiveStorage';
import { User } from 'src/types';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn';
type State = {
  status: UserSessionStatus;
  data: User | null;
};
type Action = {
  type: 'login' | 'logout';
  payload?: UserSessionStatus | User;
};

const initialState: State = {
  status: 'starting',
  data: null,
};

const UserSessionContext = React.createContext<[State, Dispatch<Action>] | undefined>(undefined);

function userSessionReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'login':
      return { ...state, status: 'loggedIn', data: action.payload as User };

    case 'logout':
      return { ...state, status: 'shouldLogIn', data: null };
  }
}

export const UserSessionProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(userSessionReducer, initialState);

  useEffect(() => {
    if (state.status === 'starting') {
      storage.getItem('user').then(
        (user) => {
          if (!user) {
            dispatch({ type: 'logout' });
          } else {
            dispatch({ type: 'login', payload: JSON.parse(user || '') as User });
          }
        },
        () => {},
      );
    }
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
