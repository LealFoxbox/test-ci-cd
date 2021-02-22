import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import InspectionsScreen from 'src/screens/Inspections';
import InspectionsFormListScreen from 'src/screens/Inspections/FormListScreen';
import InspectionFormScreen from 'src/screens/Inspections/FormScreen';
import Header from 'src/components/Header';
import { RangeChoice } from 'src/types';

import { INSPECTIONS_FORM, INSPECTIONS_FORM_LIST, INSPECTIONS_HOME } from './screenNames';

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
    title: string;
    formId: null | number;
    structureId: null | number;
    assignmentId: null | number;
    newPhoto?: { path: string; fileName: string; formFieldId: number };
    rangeChoicesSelection?: {
      listChoiceIds: RangeChoice[];
      formFieldId: number;
    };
  };
};

const Stack = createStackNavigator<InspectionsNavigatorParamList>();

const InspectionsNavigator: React.FC = () => {
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
          title: 'Inspections',
        }}
      />
    </Stack.Navigator>
  );
};

export default InspectionsNavigator;
