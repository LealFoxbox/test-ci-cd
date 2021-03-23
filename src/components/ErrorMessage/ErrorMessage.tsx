import React from 'react';
import { Text } from 'react-native-paper';

import { styled, withTheme } from 'src/paperTheme';

const ColoredText = withTheme(
  styled(Text)`
    font-size: 12px;
    color: ${({ theme }) => theme.colors.error};
    margin-bottom: 10px;
  `,
);

const ErrorMessage: React.FC<{}> = ({ children }) => <ColoredText>{children}</ColoredText>;

export default ErrorMessage;
