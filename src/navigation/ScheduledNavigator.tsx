import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import ScheduledScreen from 'src/screens/Scheduled';

import { SCHEDULED_HOME } from './screenNames';

export type ScheduledNavigatorParamList = {
  [SCHEDULED_HOME]: undefined;
};

const Stack = createStackNavigator<ScheduledNavigatorParamList>();

const ScheduledNavigator: React.FC = () => (
  <Stack.Navigator headerMode={Platform.select({ android: 'screen', ios: 'float' })}>
    <Stack.Screen
      name={SCHEDULED_HOME}
      component={ScheduledScreen}
      options={{ headerTitle: 'Scheduled', headerTitleStyle: { marginLeft: 15 } }}
    />
  </Stack.Navigator>
);

export default ScheduledNavigator;
