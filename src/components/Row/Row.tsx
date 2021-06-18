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
  value?: React.ReactNode;
  icon?: string;
  IconComponent?: typeof MaterialIcons;
  onPress?: () => void;
  spinner?: boolean;
  disabled?: boolean;
  titleColor?: string;
  iconColor?: string;
}

const Row: React.FC<RowProps> = ({
  accessibilityLabel,
  label,
  value = null,
  icon,
  IconComponent = MaterialIcons,
  disabled,
  spinner,
  onPress,
  titleColor,
  iconColor,
}) => {
  const theme = useTheme();
  const iconComponentColor = iconColor || theme.colors.placeholder;
  const styleComponentTitle = titleColor ? { color: titleColor } : undefined;
  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingLeft: 15,
      }}
    >
      {spinner && <ActivityIndicator size="small" />}
      {icon && !spinner && <IconComponent name={icon} size={24} color={iconComponentColor} />}
      {!icon && !spinner && <View style={{ marginRight: 24 }} />}
      <Card.Content style={{ flex: 1 }}>
        <Title style={styleComponentTitle}>{label}</Title>
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
