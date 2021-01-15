import React from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Card, Paragraph, Title, useTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { isString } from 'lodash/fp';

import { styled } from 'src/paperTheme';
import { getAccessibilityAndAutomationProps } from 'src/utils/accessibility';

const Container = styled.View`
  background-color: white;
  padding: 10px;
`;

const ClickableContainer = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: white;
  padding: 10px;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
`;

interface RowProps {
  label: string;
  accessibilityLabel?: string;
  value: React.ReactNode;
  icon?: string;
  onPress?: () => void;
  spinner?: boolean;
  disabled?: boolean;
}

const Row: React.FC<RowProps> = ({ accessibilityLabel, label, value, icon, disabled, spinner, onPress }) => {
  const theme = useTheme();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingLeft: 15 }}>
      {spinner && <ActivityIndicator size="small" />}
      {icon && !spinner && <MaterialIcons name={icon} size={24} color={theme.colors.placeholder} />}
      {!icon && !spinner && <View style={{ marginRight: 24 }} />}
      <Card.Content style={{ flex: 1 }}>
        <Title>{label}</Title>
        {isString(value) ? <Paragraph>{value}</Paragraph> : value}
      </Card.Content>
    </View>
  );

  if (onPress) {
    return (
      <ClickableContainer
        onPress={onPress}
        accessibilityRole="button"
        disabled={disabled}
        {...getAccessibilityAndAutomationProps(accessibilityLabel || label)}
      >
        {content}
      </ClickableContainer>
    );
  }

  return <Container>{content}</Container>;
};
export default Row;
