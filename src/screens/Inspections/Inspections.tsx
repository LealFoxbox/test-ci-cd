import React from 'react';
import { Title } from 'react-native-paper';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { DownloadStore } from 'src/pullstate/downloadStore';

import { Container, MessageContainer } from './styles';

const InspectionsScreen: React.FC<{}> = () => {
  const userData = PersistentUserStore.useState((s) => s.userData);
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
    <MessageContainer>
      <Title style={{ textAlign: 'center' }}>Job done, showing inspections from db, I swear.</Title>
    </MessageContainer>
  );
};

export default InspectionsScreen;
