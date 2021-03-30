import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import ScheduleScreen from 'src/screens/Schedule';
import InspectionFormScreen from 'src/screens/Inspections/FormScreen';
import Header from 'src/components/Header';

import { INSPECTIONS_FORM, SCHEDULE_HOME } from './screenNames';
import { InspectionsNavigatorParamList } from './InspectionsNavigator';

export type ScheduleNavigatorParamList = {
  [SCHEDULE_HOME]: { title: string };
  [INSPECTIONS_FORM]: InspectionsNavigatorParamList[typeof INSPECTIONS_FORM];
};

const Stack = createStackNavigator<ScheduleNavigatorParamList>();

const ScheduleNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ header: Header }}>
      <Stack.Screen name={SCHEDULE_HOME} component={ScheduleScreen} initialParams={{ title: 'Schedule' }} />
      <Stack.Screen name={INSPECTIONS_FORM} component={InspectionFormScreen} />
    </Stack.Navigator>
  );
};

export default ScheduleNavigator;
