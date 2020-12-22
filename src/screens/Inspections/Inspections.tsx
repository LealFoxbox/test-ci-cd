import React from 'react';
import { Title } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { INSPECTIONS_HOME } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';

import { Container, MessageContainer } from './styles';
import ItemsTable from './ItemsTable';

const InspectionsScreen: React.FC<{}> = () => {
  const userData = PersistentUserStore.useState((s) => s.userData);
  const {
    params: { parentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_HOME>>();
  // @ts-ignore
  const { push } = useNavigation();
  const { progress, error } = DownloadStore.useState((s) => s);

  if (!userData) {
    return <Container />;
  }

  if (error) {
    return (
      <MessageContainer>
        <Title style={{ textAlign: 'center' }}>An error ocurred, please reload</Title>
      </MessageContainer>
    );
  }

  if (progress !== 100) {
    return (
      <MessageContainer>
        <Title style={{ textAlign: 'center' }}>Downloading, progress is {progress}</Title>
      </MessageContainer>
    );
  }

  return (
    <ItemsTable
      parentId={parentId}
      onPress={(id) => {
        push(INSPECTIONS_HOME, { parentId: id });
      }}
    />
  );
};

export default InspectionsScreen;
