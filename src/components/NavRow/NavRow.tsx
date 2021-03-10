import React from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { styled } from 'src/paperTheme';
import { getAccessibilityAndAutomationProps } from 'src/utils/accessibility';

const Container = styled.TouchableOpacity`
  background-color: white;
  padding: 10px;
`;

interface RowProps {
  label: string;
  content?: React.ReactNode;
  accessibilityLabel?: string;
  icon?: string;
  onPress: () => void;
}

const NavRow: React.FC<RowProps> = ({ accessibilityLabel, label, content, icon, onPress }) => {
  const theme = useTheme();

  return (
    <Container
      onPress={onPress}
      accessibilityRole="button"
      {...getAccessibilityAndAutomationProps(accessibilityLabel || label)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingRight: 15, paddingLeft: 5 }}>
        {icon && (
          <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} style={{ marginLeft: 15 }} />
        )}
        <Card.Content style={{ flex: 1 }}>
          <Text>{label}</Text>
          {content || null}
        </Card.Content>
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.placeholder} />
      </View>
    </Container>
  );
};

export default NavRow;
