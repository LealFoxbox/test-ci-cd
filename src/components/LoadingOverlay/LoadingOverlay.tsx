import React from 'react';
import { ActivityIndicator, ViewProps } from 'react-native';

import { styled, withTheme } from 'src/paperTheme';

const Container = withTheme(styled.View`
  flex: 1;
  position: absolute;
  background-color: ${({ theme }) => theme.colors.backdrop};
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
`);

export type LoadingOverlayProps = ViewProps;

const LoadingOverlay: React.FC<LoadingOverlayProps> = (props) => (
  <Container {...props}>
    <ActivityIndicator size="large" />
  </Container>
);

export default LoadingOverlay;
