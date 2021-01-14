import React from 'react';
import { Paragraph, ProgressBar, useTheme } from 'react-native-paper';

import { DowloadingContainer } from './styles';

const DownloadingScreen: React.FC<{ progress: number }> = ({ progress }) => {
  const theme = useTheme();

  return (
    <DowloadingContainer>
      <ProgressBar progress={progress / 100} color={theme.colors.primary} />
      <Paragraph style={{ textAlign: 'center', marginTop: 20 }}>Downloading account data...</Paragraph>
    </DowloadingContainer>
  );
};

export default DownloadingScreen;
