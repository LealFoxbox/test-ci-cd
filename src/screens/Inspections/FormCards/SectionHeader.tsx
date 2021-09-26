import React from 'react';
import { Title } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { styled } from 'src/paperTheme';

const Container = styled.View`
  padding-right: 10px;
  flex-direction: row;
  align-items: center;
`;

interface SectionHeader {
  title: string;
  theme: ReactNativePaper.Theme;
  onPress?: () => void;
  showDeleteIcon: boolean;
  categoryId?: number | null;
}

const SectionHeader: React.FC<SectionHeader> = ({ title, theme, onPress, showDeleteIcon }) => (
  <Container>
    <Title style={{ marginLeft: 10, flex: 1 }}>{title}</Title>
    {showDeleteIcon && (
      <TouchableOpacity accessibilityRole="button" onPress={onPress}>
        <MaterialCommunityIcons color={theme.colors.primary} name="delete-outline" size={28} />
      </TouchableOpacity>
    )}
  </Container>
);

export default SectionHeader;
