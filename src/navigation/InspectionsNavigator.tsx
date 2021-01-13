import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import InspectionsScreen from 'src/screens/Inspections';
import InspectionsFormListScreen from 'src/screens/Inspections/FormListScreen';
import InspectionFormScreen from 'src/screens/Inspections/EditFormScreen';

import { INSPECTIONS_FORM, INSPECTIONS_FORM_LIST, INSPECTIONS_HOME } from './screenNames';

// type RenderRight = () => React.ReactNode;

export type InspectionsNavigatorParamList = {
  [INSPECTIONS_HOME]: {
    parentId: null | number;
  };
  [INSPECTIONS_FORM_LIST]: {
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
          headerTitleStyle: { marginLeft: 0, paddingLeft: 0 },
        }}
        initialParams={{
          parentId: null,
        }}
      />
      <Stack.Screen
        name={INSPECTIONS_FORM_LIST}
        component={InspectionsFormListScreen}
        options={{
          headerTitle: 'Inspections',
          headerTitleStyle: { marginLeft: 0, paddingLeft: 0 },
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
          headerTitleStyle: { marginLeft: 0, paddingLeft: 0 },
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
