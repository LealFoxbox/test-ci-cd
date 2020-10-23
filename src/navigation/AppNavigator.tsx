import React from 'react';

import LoadingOverlay from 'src/components/LoadingOverlay';
import { useUserSession } from 'src/contexts/userSession';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

function AppNavigator() {
  const [{ status, data }] = useUserSession();

  if (status === 'starting') {
    return <LoadingOverlay />;
  } else if (status === 'shouldLogIn') {
    return <AuthNavigator />;
  } else if (status === 'loggedIn') {
    return <MainNavigator user={data} />;
  }

  throw Error('useSession status has an unexpected value');
}

export default AppNavigator;
