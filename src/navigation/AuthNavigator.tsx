import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from 'src/screens/Login';
import Header from 'src/components/Header';

import { SIGN_IN } from './screenNames';

export type AuthNavigatorParamList = {
  [SIGN_IN]: {
    title: string;
  };
};

const Stack = createStackNavigator<AuthNavigatorParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ header: Header }}>
      <Stack.Screen name={SIGN_IN} component={LoginScreen} initialParams={{ title: 'Sign in' }} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
