import React from 'react';
import { View } from 'react-native';

import { useUserSession } from 'src/contexts/userSession';
import { User } from 'src/types';
import WebViewScreen from 'src/components/WebViewScreen';

function getInspectionsUri(user: User) {
  return `${user.features.inspection_feature.url}&user_credentials=${user.single_access_token}`;
}

const InspectionsScreen: React.FC<{}> = () => {
  const [{ data: user }] = useUserSession();

  if (!user) {
    return <View />;
  }

  return <WebViewScreen source={{ uri: getInspectionsUri(user) }} />;
};

export default InspectionsScreen;
