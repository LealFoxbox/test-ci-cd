import React, { useEffect } from 'react';
import { View } from 'react-native';
import { hide } from 'react-native-bootsplash';

import { createJob, useDownloadQueue } from 'src/pullstate/downloadQueue';
import { UserSessionEffect } from 'src/pullstate/persistentStore/effectHooks';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { FetchUserResponse, fetchtUser } from 'src/services/user';
import { useDownloader } from 'src/downloader';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

let splashHidden = false;

function AppNavigator() {
  const status = PersistentUserStore.useState((s) => s.status);
  const userData = PersistentUserStore.useState((s) => s.userData);

  useDownloader();

  const { addJob } = useDownloadQueue();

  UserSessionEffect();

  useEffect(() => {
    if (!splashHidden && status !== 'starting') {
      hide();
      splashHidden = true;
    }
  }, [status]);

  /*
  useEffect(() => {
    addJob(
      createJob<FetchUserResponse>('id', () => fetchtUser({ companyId: '1', token: 'abcd' })),
    );
  }, [addJob]);
*/
  if (status === 'shouldLogIn') {
    return <AuthNavigator />;
  } else if (status === 'loggedIn') {
    return <MainNavigator user={userData} />;
  } else {
    return <View />;
  }
}

export default AppNavigator;
