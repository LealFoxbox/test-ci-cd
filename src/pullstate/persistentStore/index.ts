import { Store } from 'pullstate';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import { fetchtUser } from 'src/services/api/user';
import { axiosCatchTo, catchTo } from 'src/utils/catchTo';
import { User } from 'src/types';
import { deleteAllJSONFiles } from 'src/services/downloader/fileUtils';
import { cleanMongo } from 'src/services/mongodb';
import { setEnv } from 'src/config';

import { initStoreStorage } from '../storeStorage';

import { PersistentState, initialState } from './initialState';

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

export const loginAction = (user: User) => {
  PersistentUserStore.update((s) => {
    s.userData = user;
    s.status = 'loggedIn';
  });
};

export const logoutAction = async () => {
  await deleteAllJSONFiles();
  await cleanMongo();

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

export const updateStructuresMeta = (currentPage: number, totalPages: number) => {
  PersistentUserStore.update((s) => {
    s.structuresDbMeta = { currentPage, totalPages };
  });
};

export const updateAssignmentsMeta = (currentPage: number, totalPages: number) => {
  PersistentUserStore.update((s) => {
    s.assignmentsDbMeta = { currentPage, totalPages };
  });
};

const { init, subscribe } = initStoreStorage('peristentUserStore', PersistentUserStore);

void init().then(async (state: PersistentState) => {
  const [permissionError] = await catchTo(requestLocationPermission());
  permissionError && console.error(permissionError);

  if (!state.userData) {
    void logoutAction();
  } else {
    setEnv(state.isStaging);

    // refetch user
    const [error, response] = await axiosCatchTo(
      fetchtUser({
        companyId: state.userData.account.subdomain,
        token: state.userData.single_access_token,
      }),
    );

    if (error || !response) {
      console.warn('fetchtUser error ', JSON.stringify(error));
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
