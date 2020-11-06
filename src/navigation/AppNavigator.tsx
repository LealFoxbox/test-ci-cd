import React, { useEffect } from 'react';
import { View } from 'react-native';
import { hide } from 'react-native-bootsplash';

import { useUserSession } from 'src/contexts/userSession';
import usePrevious from 'src/utils/usePrevious';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

function AppNavigator() {
  const [{ status, data }] = useUserSession();

  const prevStatus = usePrevious(status);

  useEffect(() => {
    if (prevStatus === 'starting' && status !== 'starting') {
      hide();
    }
  }, [status, prevStatus]);

  if (status === 'shouldLogIn') {
    return <AuthNavigator />;
  } else if (status === 'loggedIn') {
    return <MainNavigator user={data} />;
  } else {
    return <View />;
  }
}

export default AppNavigator;
