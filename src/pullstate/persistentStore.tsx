import { Store } from 'pullstate';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import { fetchtUser } from 'src/services/api';
import { axiosCatchTo, catchTo } from 'src/utils/catchTo';

import { loginAction, logoutAction } from './persistentActions';
import { State, initialState } from './persistentInitialState';
import { initStoreStorage } from './storeStorage';

export type UserSessionStatus = 'starting' | 'shouldLogIn' | 'loggedIn' | 'logoutTriggered';

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

export const PersistentUserStore = new Store(initialState);

const { init, subscribe } = initStoreStorage('peristentUserStore', PersistentUserStore);

void init().then(async (state: State) => {
  const [permissionError] = await catchTo(requestLocationPermission());
  permissionError && console.error(permissionError);

  if (!state.userData) {
    void logoutAction();
  } else {
    // refetch user
    const [error, response] = await axiosCatchTo(
      fetchtUser({
        companyId: state.userData.account.subdomain,
        token: state.userData.single_access_token,
      }),
    );

    if (error || !response) {
      console.warn(JSON.stringify(error));
      if (error?.response?.status === 401) {
        void logoutAction();
      } else {
        loginAction(state.userData);
      }
    } else {
      if (response.data) {
        loginAction(response.data.user);
      } else {
        loginAction(state.userData);
      }
    }
  }
});
subscribe();
