import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from 'src/screens/Login';

import { SIGN_IN } from './screenNames';

type RenderRight = () => React.ReactNode;

export type AuthNavigatorParamList = {
  [SIGN_IN]: { updateRenderRight: (render: RenderRight) => void };
};

const Stack = createStackNavigator<AuthNavigatorParamList>();

const AuthNavigator: React.FC = () => {
  const [renderRight, setRenderRight] = useState<RenderRight>(() => () => null);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={SIGN_IN}
        component={LoginScreen}
        options={{
          headerTitle: 'Sign in',
          headerTitleStyle: { marginLeft: 15 },
          headerRight: renderRight,
        }}
        initialParams={{ updateRenderRight: (render: RenderRight) => setRenderRight(() => render) }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
