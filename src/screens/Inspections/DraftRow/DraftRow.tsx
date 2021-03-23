import { formatDistance } from 'date-fns';
import React from 'react';
import { View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { styled } from 'src/paperTheme';
import { getAccessibilityAndAutomationProps } from 'src/utils/accessibility';

const Container = styled.TouchableOpacity`
  background-color: white;
  padding: 10px;
`;

interface RowProps {
  label: string;
  content: string;
  accessibilityLabel?: string;
  onPress: () => void;
  hasPhotos: boolean;
  lastModified: number;
}

const DraftRow: React.FC<RowProps> = ({ accessibilityLabel, label, content, hasPhotos, lastModified, onPress }) => {
  const theme = useTheme();

  return (
    <Container
      onPress={onPress}
      accessibilityRole="button"
      {...getAccessibilityAndAutomationProps(accessibilityLabel || label)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <Card.Content style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', width: '100%' }}>
            <Text style={{ flex: 1, paddingRight: 10 }}>{label}</Text>
            <Text style={{ alignSelf: 'flex-start', color: theme.colors.secondaryText }}>
              {formatDistance(Date.now(), lastModified).replace('about ', '')} ago
            </Text>
          </View>
          <View style={{ flexDirection: 'row', width: '100%', marginTop: 5 }}>
            <Text style={{ color: theme.colors.secondaryText, flex: 1 }}>{content}</Text>
            {hasPhotos && (
              <MaterialCommunityIcons
                name="paperclip"
                size={24}
                color={theme.colors.placeholder}
                style={{ transform: [{ rotate: '90deg' }] }}
              />
            )}
          </View>
        </Card.Content>
      </View>
    </Container>
  );
};

export default DraftRow;
