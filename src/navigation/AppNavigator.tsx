import React, { useEffect } from 'react';
import { View } from 'react-native';
import { hide } from 'react-native-bootsplash';

import { UserSessionEffect } from 'src/pullstate/persistentStore/effectHooks';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { useDownloader } from 'src/services/downloader';
import { clearInspectionsDataAction } from 'src/pullstate/actions';
import { useUploader } from 'src/services/uploader';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

let splashHidden = false;

function AppNavigator() {
  const status = PersistentUserStore.useState((s) => s.status);
  const userData = PersistentUserStore.useState((s) => s.userData);
  const triggerDownload = useDownloader();
  const triggerUpload = useUploader();

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
      triggerUpload();
    } else if (userData?.features.inspection_feature.enabled === false) {
      void clearInspectionsDataAction();
    }
  }, [userData, triggerDownload, triggerUpload]);

  if (status === 'shouldLogIn') {
    return <AuthNavigator />;
  } else if (status === 'loggedIn' && userData) {
    return <MainNavigator features={userData.features || {}} />;
  } else {
    return <View />;
  }
}

export default AppNavigator;
