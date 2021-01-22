import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AccountScreen from 'src/screens/Account';
import Header from 'src/components/Header';

import { ACCOUNT_HOME } from './screenNames';

export type AccountNavigatorParamList = {
  [ACCOUNT_HOME]: {
    title: string;
  };
};

const Stack = createStackNavigator<AccountNavigatorParamList>();

const AccountNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ header: Header }}>
    <Stack.Screen name={ACCOUNT_HOME} component={AccountScreen} initialParams={{ title: 'Account' }} />
  </Stack.Navigator>
);

export default AccountNavigator;
