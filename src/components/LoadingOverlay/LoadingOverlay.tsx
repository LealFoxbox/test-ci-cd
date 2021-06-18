import React from 'react';
import { ActivityIndicator } from 'react-native-paper';

import { styled, withTheme } from 'src/paperTheme';

const Container = withTheme(
  styled.View<{ backgroundColor?: string }>`
    position: absolute;
    background-color: ${({ theme, backgroundColor }) =>
      backgroundColor === undefined ? theme.colors.background : backgroundColor};
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  `,
);

interface LoadingOverlay {
  backgroundColor?: string;
}

const LoadingOverlay: React.FC<LoadingOverlay> = ({ backgroundColor }) => (
  <Container backgroundColor={backgroundColor}>
    <ActivityIndicator size="large" />
  </Container>
);

export default LoadingOverlay;
