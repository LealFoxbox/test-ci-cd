import React from 'react';
import { Text } from 'react-native-paper';
import styled from 'styled-components/native';

const ColoredText = styled(Text)`
  font-size: 12px;
  color: #ff0d10;
  margin-bottom: 10px;
`;

const ErrorMessage: React.FC<{}> = ({ children }) => <ColoredText>{children}</ColoredText>;

export default ErrorMessage;
