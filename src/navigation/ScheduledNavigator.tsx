import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import ScheduledScreen from 'src/screens/Scheduled';

import { SCHEDULED_HOME } from './screenNames';

type RenderRight = () => React.ReactNode;

export type ScheduledNavigatorParamList = {
  [SCHEDULED_HOME]: { updateRenderRight: (render: RenderRight) => void };
};

const Stack = createStackNavigator<ScheduledNavigatorParamList>();

const ScheduledNavigator: React.FC = () => {
  const [renderRight, setRenderRight] = useState<RenderRight>(() => () => null);

  return (
    <Stack.Navigator headerMode={Platform.select({ android: 'screen', ios: 'float' })}>
      <Stack.Screen
        name={SCHEDULED_HOME}
        component={ScheduledScreen}
        options={{ headerTitle: 'Schedule', headerTitleStyle: { marginLeft: 15 }, headerRight: renderRight }}
        initialParams={{ updateRenderRight: (render: RenderRight) => setRenderRight(() => render) }}
      />
    </Stack.Navigator>
  );
};

export default ScheduledNavigator;
