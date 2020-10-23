import React from 'react';
import { Text } from 'react-native-paper';

import { styled, withTheme } from 'src/paperTheme';

const Container = styled.View`
  margin-horizontal: 20px;
  margin-bottom: 10px;
`;

const ClickableContainer = styled.TouchableOpacity`
  margin-horizontal: 20px;
  margin-bottom: 10px;
`;

const Label = styled(Text)`
  font-size: 16px;
`;

const ValueText = withTheme(styled(Text)`
  font-size: 16px;
  color: ${(props) => props.theme.colors.placeholder};
`);

interface RowProps {
  label: string;
  value: string;
  onPress?: () => void;
}

const Row: React.FC<RowProps> = ({ label, value, onPress }) => {
  const content = (
    <>
      <Label>{label}</Label>
      <ValueText>{value}</ValueText>
    </>
  );

  if (onPress) {
    return <ClickableContainer onPress={onPress}>{content}</ClickableContainer>;
  }

  return <Container>{content}</Container>;
};
export default Row;
