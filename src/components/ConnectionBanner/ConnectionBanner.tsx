import React from 'react';
import { Text, useTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { styled, withTheme } from 'src/paperTheme';

const Container = withTheme(
  styled.View`
    background-color: ${({ theme }) => theme.colors.accent};
    flex-direction: row;
    align-items: center;
    justify-content: center;
  `,
);

const ColoredText = withTheme(
  styled(Text)`
    color: ${({ theme }) => theme.colors.background};
    padding: 10px;
    text-align: center;
  `,
);

interface ConnectionBannerProps {
  connected: boolean;
}

const ConnectionBanner: React.FC<ConnectionBannerProps> = ({ connected }) => {
  const theme = useTheme();

  if (connected) {
    return null;
  }

  return (
    <Container>
      <MaterialIcons name="signal-wifi-off" color={theme.colors.background} size={26} />
      <ColoredText>No internet connection</ColoredText>
    </Container>
  );
};

export default ConnectionBanner;
