import React from 'react';
import { Button, Title } from 'react-native-paper';

import { clearAllData } from 'src/services/downloader';

import { MessageContainer } from './styles';

const ErrorScreen: React.FC<{}> = () => {
  return (
    <MessageContainer>
      <Title style={{ textAlign: 'center', marginBottom: 15 }}>
        An unexpected error ocurred while downloading, please try again
      </Title>
      <Button mode="contained" dark accessibilityLabel="download" icon="cloud-download" onPress={clearAllData}>
        Download
      </Button>
    </MessageContainer>
  );
};

export default ErrorScreen;
