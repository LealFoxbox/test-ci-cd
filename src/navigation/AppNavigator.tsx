import React, { useEffect } from 'react';
import { View } from 'react-native';
import { hide } from 'react-native-bootsplash';

import { PersistentUserStore } from 'src/pullstate/persistentStore';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

let splashHidden = false;

function AppNavigator() {
  const status = PersistentUserStore.useState((s) => s.status);
  const userData = PersistentUserStore.useState((s) => s.userData);

  useEffect(() => {
    if (!splashHidden && status !== 'starting') {
      hide();
      splashHidden = true;
    }
  }, [status]);

  if (status === 'shouldLogIn') {
    return <AuthNavigator />;
  } else if (status === 'loggedIn') {
    return <MainNavigator user={userData} />;
  } else {
    return <View />;
  }
}

export default AppNavigator;
