import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import TicketsScreen from 'src/screens/Tickets';

import { TICKETS_HOME } from './screenNames';

type RenderRight = () => React.ReactNode;

export type TicketsNavigatorParamList = {
  [TICKETS_HOME]: { updateRenderRight: (render: RenderRight) => void };
};

const Stack = createStackNavigator<TicketsNavigatorParamList>();

const TicketsNavigator: React.FC = () => {
  const [renderRight, setRenderRight] = useState<RenderRight>(() => () => null);

  return (
    <Stack.Navigator headerMode={Platform.select({ android: 'screen', ios: 'float' })}>
      <Stack.Screen
        name={TICKETS_HOME}
        component={TicketsScreen}
        options={{ headerTitle: 'Tickets', headerTitleStyle: { marginLeft: 15 }, headerRight: renderRight }}
        initialParams={{ updateRenderRight: (render: RenderRight) => setRenderRight(() => render) }}
      />
    </Stack.Navigator>
  );
};

export default TicketsNavigator;
