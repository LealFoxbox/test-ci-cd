import React from 'react';
import { ViewProps } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { Container } from './styles';

export type LoadingOverlayProps = ViewProps;

const LoadingOverlay: React.FC<LoadingOverlayProps> = (props) => (
  <Container {...props}>
    <ActivityIndicator size="large" />
  </Container>
);

export default LoadingOverlay;
