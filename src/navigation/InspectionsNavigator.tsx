import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import InspectionsScreen from 'src/screens/Inspections';
import InspectionFormScreen from 'src/screens/Inspections/InspectionFormScreen';

import { INSPECTIONS_FORM, INSPECTIONS_HOME } from './screenNames';

// type RenderRight = () => React.ReactNode;

export type InspectionsNavigatorParamList = {
  [INSPECTIONS_HOME]: {
    parentId: null | number;
  };
  [INSPECTIONS_FORM]: {
    formId: null | number;
    structureId: null | number;
  };
};

const Stack = createStackNavigator<InspectionsNavigatorParamList>();

const InspectionsNavigator: React.FC = () => {
  // use pullstate header store to store the renderRight callback instead of using nav params
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={INSPECTIONS_HOME}
        component={InspectionsScreen}
        options={{
          headerTitle: 'Inspections',
          headerTitleStyle: { marginLeft: 15 },
          // headerRight: renderRight,
        }}
        initialParams={{
          parentId: null,
        }}
      />
      <Stack.Screen
        name={INSPECTIONS_FORM}
        component={InspectionFormScreen}
        options={{
          headerTitle: 'Inspections',
          headerTitleStyle: { marginLeft: 15 },
          // headerRight: renderRight,
        }}
        initialParams={{
          formId: null,
          structureId: null,
        }}
      />
    </Stack.Navigator>
  );
};

export default InspectionsNavigator;
