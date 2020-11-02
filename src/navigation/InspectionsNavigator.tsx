import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform } from 'react-native';

import InspectionsScreen from 'src/screens/Inspections';

import { INSPECTIONS_HOME } from './screenNames';

type RenderRight = () => React.ReactNode;

export type InspectionsNavigatorParamList = {
  [INSPECTIONS_HOME]: { updateRenderRight: (render: RenderRight) => void };
};

const Stack = createStackNavigator<InspectionsNavigatorParamList>();

const InspectionsNavigator: React.FC = () => {
  const [renderRight, setRenderRight] = useState<RenderRight>(() => () => null);

  return (
    <Stack.Navigator headerMode={Platform.select({ android: 'screen', ios: 'float' })}>
      <Stack.Screen
        name={INSPECTIONS_HOME}
        component={InspectionsScreen}
        options={{
          headerTitle: 'Inspections',
          headerTitleStyle: { marginLeft: 15 },
          headerRight: renderRight,
        }}
        initialParams={{ updateRenderRight: (render: RenderRight) => setRenderRight(() => render) }}
      />
    </Stack.Navigator>
  );
};

export default InspectionsNavigator;
