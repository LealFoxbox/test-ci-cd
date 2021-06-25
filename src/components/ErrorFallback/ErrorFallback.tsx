import React from 'react';
import { Button, Title, useTheme } from 'react-native-paper';
import { FallbackProps } from 'react-error-boundary';

import { styled } from 'src/paperTheme';

export const BlankContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 30px;
`;

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const theme = useTheme();
  return (
    <BlankContentContainer>
      <Title>{error?.message || 'Something went wrong'}</Title>
      <Button
        onPress={resetErrorBoundary}
        mode="contained"
        color={theme.colors.success}
        dark
        style={{ marginTop: 10, marginBottom: 20, marginHorizontal: 10 }}
        icon="replay"
      >
        Try again
      </Button>
    </BlankContentContainer>
  );
};

export default ErrorFallback;
