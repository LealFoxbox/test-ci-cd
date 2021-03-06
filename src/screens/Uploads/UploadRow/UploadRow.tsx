import React from 'react';
import { View } from 'react-native';
import { Card, Paragraph, Title, useTheme } from 'react-native-paper';
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
  head: string;
  title: string;
  content: React.ReactNode;
  accessibilityLabel?: string;
  icon: string;
  IconComponent?: typeof MaterialIcons;
  onPress?: () => void;
  spinner?: boolean;
  disabled?: boolean;
}

const UploadRow: React.FC<RowProps> = ({
  head,
  title,
  content,
  accessibilityLabel,
  icon,
  IconComponent = MaterialIcons,
  disabled,
  onPress,
}) => {
  const theme = useTheme();
  const row = (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingLeft: 15 }}>
      <IconComponent name={icon} size={24} color={theme.colors.placeholder} />
      <Card.Content style={{ flex: 1 }}>
        <Paragraph>{head.toUpperCase()}</Paragraph>
        <Title>{title}</Title>
        {isString(content) ? <Paragraph>{content}</Paragraph> : content}
      </Card.Content>
    </View>
  );

  if (onPress) {
    return (
      <ClickableContainer
        onPress={onPress}
        accessibilityRole="button"
        disabled={disabled}
        {...getAccessibilityAndAutomationProps(accessibilityLabel || title)}
      >
        {row}
      </ClickableContainer>
    );
  }

  return <Container>{row}</Container>;
};

export default UploadRow;
