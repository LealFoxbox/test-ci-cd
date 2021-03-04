import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import { Paragraph, useTheme } from 'react-native-paper';

import { getMockFlags } from 'src/config';
import { LoginStore } from 'src/pullstate/loginStore';

import ReadMore from './ReadMore';

interface NotesProps {
  value?: string | null;
  onReady?: () => void;
  isCard?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

const mockString =
  'This is an email test support@google.com. This a phone number test +542234751111 (+54)2234751111 542234751111 2234751111 475-1111 4751111. This is a url test http://www.google.com --- google.com/search?q=google+search';

const Notes: React.FC<NotesProps> = ({ value, onReady, numberOfLines, isCard, style }) => {
  const isStaging = LoginStore.useState((s) => s.isStaging);
  const content = !getMockFlags(isStaging).NOTES || value ? value : mockString;
  const theme = useTheme();

  useEffect(() => {
    if (!content) {
      onReady && onReady();
    }
  }, [content, onReady]);

  if (!content) {
    return null;
  }

  return (
    <View
      style={[
        {
          padding: 10,
          backgroundColor: theme.colors.surface,
          borderRadius: isCard ? 4 : 0,
          elevation: isCard ? 1 : 0,
          margin: isCard ? 10 : 0,
        },
        style || {},
      ]}
    >
      <ReadMore
        numberOfLines={typeof numberOfLines === 'number' ? numberOfLines : 3}
        dataDetectorType="all"
        onReady={onReady}
      >
        <Paragraph>{content}</Paragraph>
      </ReadMore>
    </View>
  );
};

export default React.memo(Notes, (prevProps, props) => {
  return prevProps.value === props.value;
});
