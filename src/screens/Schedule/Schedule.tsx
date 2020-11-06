import React from 'react';
import { View } from 'react-native';

import WebViewScreen from 'src/components/WebViewScreen';
import { useUserSession } from 'src/contexts/userSession';
import { User } from 'src/types';

function getScheduleUri(user: User) {
  return `${user.features.schedule_feature.url}&user_credentials=${user.single_access_token}`;
}

const ScheduleScreen: React.FC<{}> = () => {
  const [{ data: user }] = useUserSession();

  if (!user) {
    return <View />;
  }

  return <WebViewScreen source={{ uri: getScheduleUri(user) }} />;
};

export default ScheduleScreen;
