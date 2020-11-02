import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';

import { User } from 'src/types';

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

const Tab = createMaterialBottomTabNavigator<MainTabsNavigatorParamList>();

const MainNavigator: React.FC<{ user: User | null }> = ({ user }) => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      inactiveColor={colors.backdrop}
      activeColor={colors.primary}
      barStyle={{
        backgroundColor: colors.background,
      }}
      shifting={false}
    >
      {user?.features.inspection_feature.enabled && (
        <Tab.Screen
          name={INSPECTIONS_NAVIGATOR}
          component={InspectionsNavigator}
          options={{
            tabBarLabel: 'Inspections',
            tabBarIcon: ({ color }) => <MaterialIcons name="assignment" color={color} size={26} />,
          }}
        />
      )}
      {user?.features.schedule_feature.enabled && (
        <Tab.Screen
          name={SCHEDULED_NAVIGATOR}
          component={ScheduledNavigator}
          options={{
            tabBarLabel: 'Scheduled',
            tabBarIcon: ({ color }) => <MaterialIcons name="date-range" color={color} size={26} />,
          }}
        />
      )}
      {user?.features.ticket_feature.enabled && (
        <Tab.Screen
          name={TICKETS_NAVIGATOR}
          component={TicketsNavigator}
          options={{
            tabBarLabel: 'Tickets',
            tabBarIcon: ({ color }) => <MaterialIcons name="warning" color={color} size={26} />,
          }}
        />
      )}
      <Tab.Screen
        name={ACCOUNT_NAVIGATOR}
        component={AccountNavigator}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => <MaterialIcons name="account-circle" color={color} size={26} />,
        }}
      />
    </Tab.Navigator>
  );
};

export type MainNavigatorParamList = {
  [INSPECTIONS_NAVIGATOR]: InspectionsNavigatorParamList;
  [SCHEDULED_NAVIGATOR]: ScheduledNavigatorParamList;
  [TICKETS_NAVIGATOR]: TicketsNavigatorParamList;
  [ACCOUNT_NAVIGATOR]: AccountNavigatorParamList;
};

export default MainNavigator;
