import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import ScheduleScreen from 'src/screens/Schedule';

import { SCHEDULE_HOME } from './screenNames';

type RenderRight = () => React.ReactNode;

export type ScheduleNavigatorParamList = {
  [SCHEDULE_HOME]: { updateRenderRight: (render: RenderRight) => void };
};

const Stack = createStackNavigator<ScheduleNavigatorParamList>();

const ScheduleNavigator: React.FC = () => {
  const [renderRight, setRenderRight] = useState<RenderRight>(() => () => null);

  return (
    <Stack.Navigator headerMode={Platform.select({ android: 'screen', ios: 'float' })}>
      <Stack.Screen
        name={SCHEDULE_HOME}
        component={ScheduleScreen}
        options={{ headerTitle: 'Schedule', headerTitleStyle: { marginLeft: 15 }, headerRight: renderRight }}
        initialParams={{ updateRenderRight: (render: RenderRight) => setRenderRight(() => render) }}
      />
    </Stack.Navigator>
  );
};

export default ScheduleNavigator;
