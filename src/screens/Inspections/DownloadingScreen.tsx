import React from 'react';
import { Paragraph, ProgressBar, useTheme } from 'react-native-paper';

import ConnectionBanner from 'src/components/ConnectionBanner';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';

import { DowloadingContainer } from './styles';

const DownloadingScreen: React.FC<{ progress: number }> = ({ progress }) => {
  const theme = useTheme();
  const connected = useNetworkStatus();

  return (
    <>
      <ConnectionBanner connected={connected} />
      <DowloadingContainer>
        <ProgressBar progress={progress / 100} color={theme.colors.primary} />
        <Paragraph style={{ textAlign: 'center', marginTop: 20 }}>Downloading account data...</Paragraph>
      </DowloadingContainer>
    </>
  );
};

export default DownloadingScreen;
