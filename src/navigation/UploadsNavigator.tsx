import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import UploadsScreen from 'src/screens/Uploads';
import Header from 'src/components/Header';

import { UPLOADS_HOME } from './screenNames';

export type UploadsNavigatorParamList = {
  [UPLOADS_HOME]: {
    title: string;
  };
};

const Stack = createStackNavigator<UploadsNavigatorParamList>();

const UploadsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ header: Header }}>
    <Stack.Screen name={UPLOADS_HOME} component={UploadsScreen} initialParams={{ title: 'Uploads' }} />
  </Stack.Navigator>
);

export default UploadsNavigator;
