import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ErrorBoundary } from 'react-error-boundary';

import AccountScreen from 'src/screens/Account';
import Header from 'src/components/Header';
import ErrorFallback from 'src/components/ErrorFallback';

import { ACCOUNT_HOME } from './screenNames';

export type AccountNavigatorParamList = {
  [ACCOUNT_HOME]: {
    title: string;
  };
};

const Stack = createStackNavigator<AccountNavigatorParamList>();

const AccountNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ header: Header }}>
    <Stack.Screen
      name={ACCOUNT_HOME}
      component={() => (
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            console.warn('try again');
          }}
        >
          <AccountScreen />
        </ErrorBoundary>
      )}
      initialParams={{ title: 'Account' }}
    />
  </Stack.Navigator>
);

export default AccountNavigator;
