import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Header from 'src/components/Header';
import UploadsScreen from 'src/screens/Uploads';
import ReadonlyFormScreen from 'src/screens/Uploads/ReadonlyFormScreen';

import { UPLOADS_HOME, UPLOADS_READONLY_FORM } from './screenNames';

export type UploadsNavigatorParamList = {
  [UPLOADS_HOME]: {
    title: string;
  };
  [UPLOADS_READONLY_FORM]: {
    title: string;
    assignmentId: number;
  };
};

const Stack = createStackNavigator<UploadsNavigatorParamList>();

const UploadsNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ header: Header }}>
    <Stack.Screen name={UPLOADS_HOME} component={UploadsScreen} initialParams={{ title: 'Uploads' }} />
    <Stack.Screen name={UPLOADS_READONLY_FORM} component={ReadonlyFormScreen} initialParams={{ title: 'Uploads' }} />
  </Stack.Navigator>
);

export default UploadsNavigator;
