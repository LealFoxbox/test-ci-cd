import React from 'react';
import { View } from 'react-native';

import { User } from 'src/types';
import WebViewScreen from 'src/components/WebViewScreen';
import { PersistentUserStore } from 'src/pullstate/persistentStore';

function getInspectionsUri(user: User) {
  return `${user.features.inspection_feature.url}&user_credentials=${user.single_access_token}`;
}

const InspectionsScreen: React.FC<{}> = () => {
  const userData = PersistentUserStore.useState((s) => s.userData);

  if (!userData) {
    return <View />;
  }

  return <WebViewScreen source={{ uri: getInspectionsUri(userData) }} />;
};

export default InspectionsScreen;
