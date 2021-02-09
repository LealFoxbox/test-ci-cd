import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';

import Header from 'src/components/Header';
import SignatureScreen from 'src/screens/Inspections/SignatureScreen';
import { PersistentUserStore } from 'src/pullstate/persistentStore';

import InspectionsNavigator from './InspectionsNavigator';
import ScheduleNavigator from './ScheduleNavigator';
import TicketsNavigator from './TicketsNavigator';
import AccountNavigator from './AccountNavigator';
import {
  ACCOUNT_NAVIGATOR,
  INSPECTIONS_NAVIGATOR,
  SCHEDULE_NAVIGATOR,
  SIGNATURE_MODAL,
  TAB_STACK_NAVIGATOR,
  TICKETS_NAVIGATOR,
} from './screenNames';

export type MainTabsNavigatorParamList = {
  [INSPECTIONS_NAVIGATOR]: undefined;
  [SCHEDULE_NAVIGATOR]: undefined;
  [TICKETS_NAVIGATOR]: undefined;
  [ACCOUNT_NAVIGATOR]: undefined;
};

export type MainNavigatorParamList = {
  [TAB_STACK_NAVIGATOR]: undefined;
  [SIGNATURE_MODAL]: { title: string; assignmentId: number; formFieldId: number };
};

const TabStack = createMaterialBottomTabNavigator<MainTabsNavigatorParamList>();
const MainStack = createStackNavigator<MainNavigatorParamList>();

const TabStackNavigator: React.FC = () => {
  const { colors } = useTheme();
  const userData = PersistentUserStore.useState((s) => s.userData);

  if (!userData) {
    return null;
  }

  return (
    <TabStack.Navigator
      inactiveColor={colors.backdrop}
      activeColor={colors.primary}
      barStyle={{
        backgroundColor: colors.surface,
      }}
      shifting={false}
      backBehavior="none"
    >
      {userData.features.inspection_feature.enabled && (
        <TabStack.Screen
          name={INSPECTIONS_NAVIGATOR}
          component={InspectionsNavigator}
          options={{
            tabBarLabel: 'Inspections',
            tabBarIcon: ({ color }) => <MaterialIcons name="assignment" color={color} size={26} />,
          }}
        />
      )}
      {userData.features.schedule_feature.enabled && (
        <TabStack.Screen
          name={SCHEDULE_NAVIGATOR}
          component={ScheduleNavigator}
          options={{
            tabBarLabel: 'Schedule',
            tabBarIcon: ({ color }) => <MaterialIcons name="date-range" color={color} size={26} />,
          }}
        />
      )}
      {userData.features.ticket_feature.enabled && (
        <TabStack.Screen
          name={TICKETS_NAVIGATOR}
          component={TicketsNavigator}
          options={{
            tabBarLabel: 'Tickets',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="warning" color={color} size={26} style={{ marginRight: -1 }} />
            ),
          }}
        />
      )}
      <TabStack.Screen
        name={ACCOUNT_NAVIGATOR}
        component={AccountNavigator}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => <MaterialIcons name="account-circle" color={color} size={26} />,
        }}
      />
    </TabStack.Navigator>
  );
};

const MainStackNavigator: React.FC = () => (
  <MainStack.Navigator mode="modal" screenOptions={{ header: Header }}>
    <MainStack.Screen name={TAB_STACK_NAVIGATOR} component={TabStackNavigator} options={{ headerShown: false }} />
    <MainStack.Screen name={SIGNATURE_MODAL} component={SignatureScreen} initialParams={{ title: 'Signature' }} />
  </MainStack.Navigator>
);

export default MainStackNavigator;
