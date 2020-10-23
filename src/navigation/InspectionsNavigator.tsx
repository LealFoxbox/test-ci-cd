import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import InspectionsScreen from 'src/screens/Inspections';

import { INSPECTIONS_HOME } from './screenNames';

export type InspectionsNavigatorParamList = {
  [INSPECTIONS_HOME]: undefined;
};

const Stack = createStackNavigator<InspectionsNavigatorParamList>();

const InspectionsNavigator: React.FC = () => (
  <Stack.Navigator headerMode={Platform.select({ android: 'screen', ios: 'float' })}>
    <Stack.Screen
      name={INSPECTIONS_HOME}
      component={InspectionsScreen}
      options={{ headerTitle: 'Inspections', headerTitleStyle: { marginLeft: 15 } }}
    />
  </Stack.Navigator>
);

export default InspectionsNavigator;
