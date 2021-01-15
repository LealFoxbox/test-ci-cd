import React from 'react';
import { View } from 'react-native';

import WebViewScreen from 'src/components/WebViewScreen';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { User } from 'src/types';

function getTicketsUri(user: User) {
  return `${user.features.ticket_feature.url}&user_credentials=${user.single_access_token}`;
}

const TicketsScreen: React.FC<{}> = () => {
  const userData = PersistentUserStore.useState((s) => s.userData);

  if (!userData) {
    return <View />;
  }

  return <WebViewScreen source={{ uri: getTicketsUri(userData) }} />;
};

export default TicketsScreen;
