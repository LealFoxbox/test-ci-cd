import React, { useEffect } from 'react';
import { View } from 'react-native';
import { hide } from 'react-native-bootsplash';

import { UserSessionEffect } from 'src/pullstate/persistentStore/effectHooks';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { clearInspectionsData, useDownloader } from 'src/services/downloader';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

let splashHidden = false;

function AppNavigator() {
  const status = PersistentUserStore.useState((s) => s.status);
  const userData = PersistentUserStore.useState((s) => s.userData);
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
      void clearInspectionsData();
    }
  }, [userData, triggerDownload]);

  if (status === 'shouldLogIn') {
    return <AuthNavigator />;
  } else if (status === 'loggedIn' && userData) {
    return <MainNavigator features={userData.features || {}} />;
  } else {
    return <View />;
  }
}

export default AppNavigator;
