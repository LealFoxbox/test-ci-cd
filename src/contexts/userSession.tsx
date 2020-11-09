import React, { Dispatch, useEffect, useReducer } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import { fetchtUser } from 'src/services/api';
import storage from 'src/utils/sensitiveStorage';
import { catchTo } from 'src/utils/catchTo';
import { setEnv } from 'src/config';
import { User } from 'src/types';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn' | 'logoutTriggered';
type State = {
  status: UserSessionStatus;
  data: User | null;
};
type Action = {
  type: 'login' | 'start_logout' | 'finish_logout';
  payload?: UserSessionStatus | User;
};

export const initialState: State = {
  status: 'starting',
  data: null,
};

export const UserSessionContext = React.createContext<[State, Dispatch<Action>] | undefined>(undefined);

async function refetchUser(dispatch: React.Dispatch<Action>, user: User) {
  try {
    const response = await fetchtUser({
      companyId: user.account.subdomain,
      token: user.single_access_token,
    });

    if (response.data) {
      dispatch({ type: 'login', payload: response.data.user });
    } else {
      dispatch({ type: 'login', payload: user });
    }
  } catch (e) {
    console.warn(JSON.stringify(e));
    if (e?.response?.status === 401) {
      dispatch({ type: 'start_logout' });
    } else {
      dispatch({ type: 'login', payload: user });
    }
  }
}

async function requestLocationPermission() {
  const reqFn = Platform.select({
    ios: async () => {
      try {
        const response = await Geolocation.requestAuthorization('whenInUse');
        return response === 'granted';
      } catch (e) {
        return false;
      }
    },
    android: async () => {
      try {
        const response = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          title: 'Location Access Permission',
          message: 'We would like to use your location',
          buttonPositive: 'Okay',
        });

        return response === PermissionsAndroid.RESULTS.GRANTED;
      } catch (e) {
        return false;
      }
    },
  });

  if (!reqFn) {
    return false;
  }

  return reqFn();
}

export function userSessionReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'login':
      return { ...state, status: 'loggedIn', data: action.payload as User };

    case 'start_logout':
      return { ...state, status: 'logoutTriggered' };
    case 'finish_logout':
      return { ...state, status: 'shouldLogIn', data: null };
  }
}

export const UserSessionProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(userSessionReducer, initialState);

  useEffect(() => {
    (async () => {
      if (state.status === 'logoutTriggered') {
        await storage.clearAll();
        dispatch({ type: 'finish_logout' });
      } else if (state.status === 'starting') {
        const [permissionError] = await catchTo(requestLocationPermission());
        permissionError && console.error(permissionError);

        const [userStorageError, userString] = await catchTo(storage.getItem('user'));
        userStorageError && console.error(userStorageError);
        const user = JSON.parse(userString || 'null') as User;

        if (!user) {
          dispatch({ type: 'start_logout' });
        } else {
          const [stagingStorageError, isStagingString] = await catchTo(storage.getItem('isStaging'));
          stagingStorageError && console.error(stagingStorageError);

          setEnv(JSON.parse(isStagingString || 'false') as boolean);
          await refetchUser(dispatch, user);
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
