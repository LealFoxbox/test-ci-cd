import React, { useEffect } from 'react';
import { View } from 'react-native';
import { hide } from 'react-native-bootsplash';

import { UserSessionEffect } from 'src/pullstate/persistentStore/effectHooks';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { useDownloader } from 'src/services/downloader';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

let splashHidden = false;

function AppNavigator() {
  const status = PersistentUserStore.useState((s) => s.status);
  const userData = PersistentUserStore.useState((s) => s.userData);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const triggerDownload = useDownloader();

  UserSessionEffect();

  useEffect(() => {
    if (!splashHidden && status !== 'starting') {
      hide();
      splashHidden = true;
    }
  }, [status]);

  useEffect(() => {
    if (userData?.features.inspection_feature.enabled) {
      triggerDownload();
    } else if (userData?.features.inspection_feature.enabled === false) {
      // TODO: delete all of the files and db
    }
  }, [userData, triggerDownload]);

  if (status === 'shouldLogIn') {
    return <AuthNavigator />;
  } else if (status === 'loggedIn' && userData) {
    return <MainNavigator user={userData} />;
  } else {
    return <View />;
  }
}

export default AppNavigator;
