import React from 'react';
import { View } from 'react-native';
import { Card, Title, useTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { styled } from 'src/paperTheme';
import { getAccessibilityAndAutomationProps } from 'src/utils/accessibility';

const Container = styled.TouchableOpacity`
  background-color: white;
  padding: 10px;
`;

interface RowProps {
  label: string;
  accessibilityLabel?: string;
  icon?: string;
  onPress: () => void;
}

const NavRow: React.FC<RowProps> = ({ accessibilityLabel, label, icon, onPress }) => {
  const theme = useTheme();

  return (
    <Container
      onPress={onPress}
      accessibilityRole="button"
      {...getAccessibilityAndAutomationProps(accessibilityLabel || label)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 15 }}>
        {icon && <MaterialIcons name={icon} size={24} color={theme.colors.primary} />}
        <Card.Content style={{ flex: 1 }}>
          <Title>{label}</Title>
        </Card.Content>
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.placeholder} />
      </View>
    </Container>
  );
};
export default NavRow;
