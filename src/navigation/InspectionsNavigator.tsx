import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from 'react-native-paper';

import InspectionsScreen from 'src/screens/Inspections';
import InspectionsFormListScreen from 'src/screens/Inspections/FormListScreen';
import InspectionFormScreen from 'src/screens/Inspections/FormScreen';
import DraftsScreen from 'src/screens/Inspections/DraftsScreen';
import Header from 'src/components/Header';
import { RangeChoice } from 'src/types';

import { INSPECTIONS_CHILDREN, INSPECTIONS_FORM, INSPECTIONS_FORM_LIST, INSPECTIONS_HOME } from './screenNames';

export type InspectionsNavigatorParamList = {
  [INSPECTIONS_HOME]: { parentId: null | number; title: string; hasSubheader: boolean };
  [INSPECTIONS_CHILDREN]: {
    parentId: number;
    title: string;
  };
  [INSPECTIONS_FORM_LIST]: {
    parentId: number;
    title: string;
  };
  [INSPECTIONS_FORM]: {
    title: string;
    formId: number;
    structureId: number;
    assignmentId: number;
    newPhoto?: { path: string; fileName: string; formFieldId: number };
    rangeChoicesSelection?: {
      listChoiceIds: RangeChoice[];
      formFieldId: number;
    };
  };
};

const TabNav = createMaterialTopTabNavigator();

function InspectionTabsNavigator() {
  const theme = useTheme();

  return (
    <TabNav.Navigator
      tabBarOptions={{
        activeTintColor: theme.colors.surface,
        inactiveTintColor: `${theme.colors.surface}AA`,
        indicatorStyle: { backgroundColor: theme.colors.surface },
        style: { backgroundColor: theme.colors.primary },
        labelStyle: { fontWeight: 'bold' },
      }}
    >
      <TabNav.Screen
        name="Areas"
        component={InspectionsScreen}
        initialParams={{
          parentId: null,
        }}
      />
      <TabNav.Screen name="Drafts" component={DraftsScreen} />
    </TabNav.Navigator>
  );
}

const Stack = createStackNavigator<InspectionsNavigatorParamList>();

const InspectionsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ header: Header }}>
      <Stack.Screen
        name={INSPECTIONS_HOME}
        component={InspectionTabsNavigator}
        initialParams={{
          parentId: null,
          title: 'Inspections',
          hasSubheader: true,
        }}
      />
      <Stack.Screen
        name={INSPECTIONS_CHILDREN}
        component={InspectionsScreen}
        initialParams={{
          title: 'Inspections',
        }}
      />
      <Stack.Screen
        name={INSPECTIONS_FORM_LIST}
        component={InspectionsFormListScreen}
        initialParams={{
          title: 'Inspections',
        }}
      />
      <Stack.Screen
        name={INSPECTIONS_FORM}
        component={InspectionFormScreen}
        initialParams={{
          title: 'Inspections',
        }}
      />
    </Stack.Navigator>
  );
};

export default InspectionsNavigator;
