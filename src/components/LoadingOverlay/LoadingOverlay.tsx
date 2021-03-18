import React from 'react';
import { ActivityIndicator } from 'react-native-paper';

import { styled, withTheme } from 'src/paperTheme';

const Container = withTheme(
  styled.View`
    position: absolute;
    background-color: ${({ theme }) => theme.colors.background};
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  `,
);

const LoadingOverlay: React.FC<{}> = () => (
  <Container>
    <ActivityIndicator size="large" />
  </Container>
);

export default LoadingOverlay;
