import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from 'react-native-paper';

import InspectionsScreen from 'src/screens/Inspections';
import InspectionsFormListScreen from 'src/screens/Inspections/FormListScreen';
import InspectionSearchScreen from 'src/screens/Inspections/SearchScreen';
import InspectionFormScreen from 'src/screens/Inspections/FormScreen';
import DraftsScreen from 'src/screens/Inspections/DraftsScreen';
import SearchHeader from 'src/components/SearchHeader';
import Header from 'src/components/Header';
import { RangeChoice } from 'src/types';

import {
  INSPECTIONS_CHILDREN,
  INSPECTIONS_FORM,
  INSPECTIONS_FORM_LIST,
  INSPECTIONS_HOME,
  INSPECTIONS_SEARCH_RESULTS,
} from './screenNames';

export type InspectionsNavigatorParamList = {
  [INSPECTIONS_HOME]: {
    parentId: null | number;
    title: string;
    hasSubheader: boolean;
    hasSearch: boolean;
    showLocationPath: boolean;
  };
  [INSPECTIONS_SEARCH_RESULTS]: {
    hasSearch: true;
    searchInput: string;
  };
  [INSPECTIONS_CHILDREN]: {
    parentId: number;
    title: string;
    hasSearch: boolean;
    showLocationPath: boolean;
  };
  [INSPECTIONS_FORM_LIST]: {
    parentId: number;
    title: string;
    hasSearch: boolean;
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
          hasSearch: true,
          showLocationPath: true,
        }}
      />
      <Stack.Screen
        name={INSPECTIONS_CHILDREN}
        component={InspectionsScreen}
        initialParams={{
          title: 'Inspections',
          showLocationPath: false,
        }}
      />
      <Stack.Screen
        name={INSPECTIONS_SEARCH_RESULTS}
        component={InspectionSearchScreen}
        initialParams={{
          hasSearch: true,
          searchInput: '',
        }}
        options={{ header: SearchHeader }}
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
