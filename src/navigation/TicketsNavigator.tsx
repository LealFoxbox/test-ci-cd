import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import TicketsScreen from 'src/screens/Tickets';

import { TICKETS_HOME } from './screenNames';

export type TicketsNavigatorParamList = {
  [TICKETS_HOME]: undefined;
};

const Stack = createStackNavigator<TicketsNavigatorParamList>();

const TicketsNavigator: React.FC = () => (
  <Stack.Navigator headerMode={Platform.select({ android: 'screen', ios: 'float' })}>
    <Stack.Screen
      name={TICKETS_HOME}
      component={TicketsScreen}
      options={{ headerTitle: 'Tickets', headerTitleStyle: { marginLeft: 15 } }}
    />
  </Stack.Navigator>
);

export default TicketsNavigator;
