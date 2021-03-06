import React, { useEffect } from 'react';
import { View } from 'react-native';
import { hide } from 'react-native-bootsplash';

import { useDownloader } from 'src/services/downloader';
import { clearInspectionsDataAction } from 'src/pullstate/actions';
import { useUploader } from 'src/services/uploader';
import { LoginStore } from 'src/pullstate/loginStore';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { requestLocationPermission } from 'src/utils/getCurrentPosition';
import { askStoragePermission } from 'src/services/storage';
import { useAutomaticallyRemove } from 'src/services/automaticallyRemove';

import AuthNavigator from './AuthNavigator';
import MainStackNavigator from './MainStackNavigator';

let splashHidden = false;

function AppNavigator() {
  const { status, userData } = LoginStore.useState((s) => ({ status: s.status, userData: s.userData }));
  const persistentStoreIsInitialized = PersistentUserStore.useState((s) => s.initialized);

  const [, triggerDownload] = useDownloader();
  const [, triggerUpload] = useUploader();
  const [, triggerAutomaticallyRemove] = useAutomaticallyRemove();

  useEffect(() => {
    if (!splashHidden && status !== 'starting') {
      hide();
      splashHidden = true;
    }
  }, [status]);

  useEffect(() => {
    if (userData && status !== 'starting' && persistentStoreIsInitialized) {
      (async () => {
        const inspectionFeature = userData.features.inspection_feature.enabled;

        if (inspectionFeature) {
          await askStoragePermission();
          void requestLocationPermission();
          triggerDownload();
          triggerUpload();
        } else if (inspectionFeature === false) {
          void clearInspectionsDataAction({});
        }
      })();
    }
  }, [userData, triggerDownload, triggerUpload, status, persistentStoreIsInitialized]);

  useEffect(() => {
    if (userData && status !== 'starting' && persistentStoreIsInitialized) {
      triggerAutomaticallyRemove();
    }
  }, [persistentStoreIsInitialized, status, triggerAutomaticallyRemove, userData]);

  if (status === 'shouldLogIn') {
    return <AuthNavigator />;
  } else if (status === 'loggedIn' && userData) {
    return <MainStackNavigator />;
  } else {
    return <View />;
  }
}

export default AppNavigator;
