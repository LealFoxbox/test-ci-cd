import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import AccountScreen from 'src/screens/Account';

import { ACCOUNT_HOME } from './screenNames';

export type AccountNavigatorParamList = {
  [ACCOUNT_HOME]: undefined;
};

const Stack = createStackNavigator<AccountNavigatorParamList>();

const AccountNavigator: React.FC = () => (
  <Stack.Navigator headerMode={Platform.select({ android: 'screen', ios: 'float' })}>
    <Stack.Screen name={ACCOUNT_HOME} component={AccountScreen} options={{ headerTitle: 'Account' }} />
  </Stack.Navigator>
);

export default AccountNavigator;
