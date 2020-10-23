import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

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

  return (
    <WebView
      source={{ uri: getTicketsUri(user) }}
      style={{ flex: 1 }}
      allowFileAccess
      renderLoading={() => <ActivityIndicator />}
      allowUniversalAccessFromFileURLs
      originWhitelist={['*']}
      onError={(err) => {
        console.log('err', err);
      }}
    />
  );
};

export default TicketsScreen;
