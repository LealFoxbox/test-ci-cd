import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { useUserSession } from 'src/contexts/userSession';
import { getBaseUrl } from 'src/services/api';
import { User } from 'src/types';

function getScheduledUri(user: User) {
  return `${getBaseUrl(user.account.subdomain)}/inspection_events?user_credentials=${user.single_access_token}`;
}

const ScheduledScreen: React.FC<{}> = () => {
  const [{ data: user }] = useUserSession();

  if (!user) {
    return <View />;
  }

  return (
    <WebView
      source={{ uri: getScheduledUri(user) }}
      style={{ flex: 1 }}
      allowFileAccess
      renderLoading={() => <ActivityIndicator />}
      allowUniversalAccessFromFileURLs
      originWhitelist={['*']}
      onError={(err) => {
        console.error('err', err);
      }}
    />
  );
};

export default ScheduledScreen;
