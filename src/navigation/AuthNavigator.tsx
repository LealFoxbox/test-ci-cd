import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from 'src/screens/Login';

import { SIGN_IN } from './screenNames';

type SignUpParams = {
  email: string;
  id: string;
  verification_code: string;
};

type AuthNavigatorParamList = {
  [SIGN_IN]: undefined;
};

type AuthNavigatorProps = {
  // if signUpParams doesn't exist, then the user should sign in. If it exists then the user should signUp
  signUpParams?: SignUpParams;
};

const Stack = createStackNavigator<AuthNavigatorParamList>();

const AuthNavigator: React.FC<AuthNavigatorProps> = () => (
  <Stack.Navigator>
    <Stack.Screen
      name={SIGN_IN}
      component={LoginScreen}
      options={{ headerTitle: 'Sign in', headerTitleStyle: { marginLeft: 15 } }}
    />
  </Stack.Navigator>
);

export default AuthNavigator;
