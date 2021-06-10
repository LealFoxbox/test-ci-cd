import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-paper';

import Header from 'src/components/Header';
import SignatureScreen from 'src/screens/Inspections/SignatureScreen';
import RatingChoicesScreen from 'src/screens/Inspections/RatingChoicesScreen';
import { LoginStore } from 'src/pullstate/loginStore';

import InspectionsNavigator from './InspectionsNavigator';
import ScheduleNavigator from './ScheduleNavigator';
import TicketsNavigator from './TicketsNavigator';
import AccountNavigator from './AccountNavigator';
import {
  ACCOUNT_NAVIGATOR,
  BOTTOM_TAB_NAVIGATOR,
  INSPECTIONS_NAVIGATOR,
  RATING_CHOICES_MODAL,
  SCHEDULE_NAVIGATOR,
  SIGNATURE_MODAL,
  TICKETS_NAVIGATOR,
  UPLOADS_NAVIGATOR,
} from './screenNames';
import UploadsNavigator from './UploadsNavigator';

export type MainTabsNavigatorParamList = {
  [INSPECTIONS_NAVIGATOR]: undefined;
  [SCHEDULE_NAVIGATOR]: undefined;
  [TICKETS_NAVIGATOR]: undefined;
  [UPLOADS_NAVIGATOR]: undefined;
  [ACCOUNT_NAVIGATOR]: undefined;
};

export type MainNavigatorParamList = {
  [BOTTOM_TAB_NAVIGATOR]: undefined;
  [SIGNATURE_MODAL]: {
    title: string;
    assignmentId: number;
    formFieldId: number;
    screenName?: string;
  };
  [RATING_CHOICES_MODAL]: {
    title: string;
    assignmentId: number;
    ratingId: number;
    formFieldId: number;
    screenName?: string;
  };
};

export type SignatureModalRoute = RouteProp<MainNavigatorParamList, typeof SIGNATURE_MODAL>;
export type SignatureModalParams = SignatureModalRoute['params'];
export type RatingChoicesModalRoute = RouteProp<MainNavigatorParamList, typeof RATING_CHOICES_MODAL>;
export type RatingChoicesModalParams = RatingChoicesModalRoute['params'];

const TabStack = createMaterialBottomTabNavigator<MainTabsNavigatorParamList>();
const MainStack = createStackNavigator<MainNavigatorParamList>();

const BottomTabNavigator: React.FC = () => {
  const { colors } = useTheme();
  const userData = LoginStore.useState((s) => s.userData);

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
            tabBarIcon: ({ color }) => (
              <MaterialIcons testID={'assignment-button-navigator'} name="assignment" color={color} size={26} />
            ),
          }}
        />
      )}
      {userData.features.schedule_feature.enabled && (
        <TabStack.Screen
          name={SCHEDULE_NAVIGATOR}
          component={ScheduleNavigator}
          options={{
            tabBarLabel: 'Schedule',
            tabBarIcon: ({ color }) => (
              <MaterialIcons testID={'schedule-button-navigator'} name="date-range" color={color} size={26} />
            ),
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
              <MaterialIcons
                name="warning"
                testID={'warning-button-navigator'}
                color={color}
                size={26}
                style={{ marginRight: -1 }}
              />
            ),
          }}
        />
      )}
      {userData.features.inspection_feature.enabled && (
        <TabStack.Screen
          name={UPLOADS_NAVIGATOR}
          component={UploadsNavigator}
          options={{
            tabBarLabel: 'Uploads',
            tabBarIcon: ({ color }) => (
              <MaterialIcons testID={'uploads-button-navigator'} name="arrow-circle-up" color={color} size={26} />
            ),
          }}
        />
      )}
      <TabStack.Screen
        name={ACCOUNT_NAVIGATOR}
        component={AccountNavigator}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => (
            <MaterialIcons testID={'uploads-button-navigator'} name="account-circle" color={color} size={26} />
          ),
        }}
      />
    </TabStack.Navigator>
  );
};

const MainStackNavigator: React.FC = () => (
  <MainStack.Navigator mode="modal" screenOptions={{ header: Header }}>
    <MainStack.Screen name={BOTTOM_TAB_NAVIGATOR} component={BottomTabNavigator} options={{ headerShown: false }} />
    <MainStack.Screen name={SIGNATURE_MODAL} component={SignatureScreen} />
    <MainStack.Screen name={RATING_CHOICES_MODAL} component={RatingChoicesScreen} />
  </MainStack.Navigator>
);

export default MainStackNavigator;
