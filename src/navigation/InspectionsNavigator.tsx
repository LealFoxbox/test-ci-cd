import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import InspectionsScreen from 'src/screens/Inspections';
import InspectionsFormListScreen from 'src/screens/Inspections/FormListScreen';
import InspectionFormScreen from 'src/screens/Inspections/Form/FormScreen';
import Header from 'src/components/Header';

import { INSPECTIONS_FORM, INSPECTIONS_FORM_LIST, INSPECTIONS_HOME } from './screenNames';

// type RenderRight = () => React.ReactNode;

export type InspectionsNavigatorParamList = {
  [INSPECTIONS_HOME]: {
    parentId: null | number;
    title: string;
  };
  [INSPECTIONS_FORM_LIST]: {
    parentId: null | number;
    title: string;
  };
  [INSPECTIONS_FORM]: {
    formId: null | number;
    structureId: null | number;
    assignmentId: null | number;
  };
};

const Stack = createStackNavigator<InspectionsNavigatorParamList>();

const InspectionsNavigator: React.FC = () => {
  // use pullstate header store to store the renderRight callback instead of using nav params
  return (
    <Stack.Navigator screenOptions={{ header: Header }}>
      <Stack.Screen
        name={INSPECTIONS_HOME}
        component={InspectionsScreen}
        initialParams={{
          parentId: null,
          title: 'Inspections',
        }}
      />
      <Stack.Screen
        name={INSPECTIONS_FORM_LIST}
        component={InspectionsFormListScreen}
        initialParams={{
          parentId: null,
          title: 'Inspections',
        }}
      />
      <Stack.Screen
        name={INSPECTIONS_FORM}
        component={InspectionFormScreen}
        initialParams={{
          formId: null,
          structureId: null,
          assignmentId: null,
        }}
      />
    </Stack.Navigator>
  );
};

export default InspectionsNavigator;
