import React from 'react';
import { View } from 'react-native';

import WebViewScreen from 'src/components/WebViewScreen';
import { useUserSession } from 'src/contexts/userSession';
import { User } from 'src/types';

function getTicketsUri(user: User) {
  return `${user.features.ticket_feature.url}&user_credentials=${user.single_access_token}`;
}

const TicketsScreen: React.FC<{}> = () => {
  const [{ data: user }] = useUserSession();

  if (!user) {
    return <View />;
  }

  return <WebViewScreen source={{ uri: getTicketsUri(user) }} />;
};

export default TicketsScreen;
