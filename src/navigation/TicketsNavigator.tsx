import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import TicketsScreen from 'src/screens/Tickets';
import Header from 'src/components/Header';

import { TICKETS_HOME } from './screenNames';

export type TicketsNavigatorParamList = {
  [TICKETS_HOME]: { title: string };
};

const Stack = createStackNavigator<TicketsNavigatorParamList>();

const TicketsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ header: Header }}>
      <Stack.Screen name={TICKETS_HOME} component={TicketsScreen} initialParams={{ title: 'Tickets' }} />
    </Stack.Navigator>
  );
};

export default TicketsNavigator;
