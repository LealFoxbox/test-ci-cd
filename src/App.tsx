import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { enableScreens } from 'react-native-screens';

import { UserSessionProvider } from 'src/contexts/userSession';
import AppNavigator from 'src/navigation/AppNavigator';

import paperTheme from './paperTheme';

enableScreens();

const App = () => {
  return (
    <NavigationContainer>
      <UserSessionProvider>
        <PaperProvider theme={paperTheme}>
          <AppNavigator />
        </PaperProvider>
      </UserSessionProvider>
    </NavigationContainer>
  );
};

export default App;
