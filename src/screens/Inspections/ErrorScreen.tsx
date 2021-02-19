import React from 'react';
import { Button, Title } from 'react-native-paper';

import ConnectionBanner from 'src/components/ConnectionBanner';
import { styled } from 'src/paperTheme';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';

const MessageContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 30px;
`;

const ErrorScreen: React.FC<{}> = () => {
  const connected = useNetworkStatus();

  return (
    <>
      <ConnectionBanner connected={connected} />
      <MessageContainer>
        <Title style={{ textAlign: 'center', marginBottom: 15 }}>
          An error has ocurred while downloading, please try again
        </Title>
        <Button
          mode="contained"
          disabled={!connected}
          dark
          accessibilityLabel="download"
          icon="cloud-download"
          onPress={() => {
            // this triggers a retry
            DownloadStore.update((s) => {
              s.progress = 0;
              s.error = null;
            });
          }}
        >
          Download
        </Button>
      </MessageContainer>
    </>
  );
};

export default ErrorScreen;
