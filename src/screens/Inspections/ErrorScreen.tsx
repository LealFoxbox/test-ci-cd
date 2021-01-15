import React from 'react';
import { Button, Title } from 'react-native-paper';

import ConnectionBanner from 'src/components/ConnectionBanner';
import { clearAllData } from 'src/services/downloader';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';

import { MessageContainer } from './styles';

const ErrorScreen: React.FC<{}> = () => {
  const connected = useNetworkStatus();

  return (
    <>
      <ConnectionBanner connected={connected} />
      <MessageContainer>
        <Title style={{ textAlign: 'center', marginBottom: 15 }}>
          An unexpected error ocurred while downloading, please try again
        </Title>
        <Button
          mode="contained"
          disabled={!connected}
          dark
          accessibilityLabel="download"
          icon="cloud-download"
          onPress={clearAllData}
        >
          Download
        </Button>
      </MessageContainer>
    </>
  );
};

export default ErrorScreen;
