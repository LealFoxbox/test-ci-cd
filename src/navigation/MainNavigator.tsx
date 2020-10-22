import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';

import InspectionsNavigator, { InspectionsNavigatorParamList } from './InspectionsNavigator';
import ScheduledNavigator, { ScheduledNavigatorParamList } from './ScheduledNavigator';
import TicketsNavigator, { TicketsNavigatorParamList } from './TicketsNavigator';
import AccountNavigator, { AccountNavigatorParamList } from './AccountNavigator';
import { ACCOUNT_NAVIGATOR, INSPECTIONS_NAVIGATOR, SCHEDULED_NAVIGATOR, TICKETS_NAVIGATOR } from './screenNames';

export type MainTabsNavigatorParamList = {
  [INSPECTIONS_NAVIGATOR]: undefined;
  [SCHEDULED_NAVIGATOR]: undefined;
  [TICKETS_NAVIGATOR]: undefined;
  [ACCOUNT_NAVIGATOR]: undefined;
};

const Tab = createBottomTabNavigator<MainTabsNavigatorParamList>();

function MainNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      tabBarOptions={{
        inactiveBackgroundColor: colors.background,
        activeBackgroundColor: colors.background,
        activeTintColor: colors.primary,
        inactiveTintColor: colors.text,
        style: {
          backgroundColor: colors.background,
          borderTopColor: colors.primary,
        },
      }}
    >
      <Tab.Screen
        name={INSPECTIONS_NAVIGATOR}
        component={InspectionsNavigator}
        options={{
          tabBarLabel: 'Inspections',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="assignment" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={SCHEDULED_NAVIGATOR}
        component={ScheduledNavigator}
        options={{
          tabBarLabel: 'Scheduled',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="date-range" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={TICKETS_NAVIGATOR}
        component={TicketsNavigator}
        options={{
          tabBarLabel: 'Tickets',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="warning" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ACCOUNT_NAVIGATOR}
        component={AccountNavigator}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="account-circle" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export type MainNavigatorParamList = {
  [INSPECTIONS_NAVIGATOR]: InspectionsNavigatorParamList;
  [SCHEDULED_NAVIGATOR]: ScheduledNavigatorParamList;
  [TICKETS_NAVIGATOR]: TicketsNavigatorParamList;
  [ACCOUNT_NAVIGATOR]: AccountNavigatorParamList;
};

export default MainNavigator;
