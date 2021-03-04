import React from 'react';
import { View } from 'react-native';

import WebViewScreen from 'src/components/WebViewScreen';
import { LoginStore } from 'src/pullstate/loginStore';
import { User } from 'src/types';

function getScheduleUri(user: User) {
  return `${user.features.schedule_feature.url}&user_credentials=${user.single_access_token}`;
}

const ScheduleScreen: React.FC<{}> = () => {
  const userData = LoginStore.useState((s) => s.userData);

  if (!userData) {
    return <View />;
  }

  return <WebViewScreen source={{ uri: getScheduleUri(userData) }} />;
};

export default ScheduleScreen;
