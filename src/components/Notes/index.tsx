import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Paragraph, useTheme } from 'react-native-paper';

import config from 'src/config';

import ReadMore from './ReadMore';

interface NotesProps {
  value?: string | null;
  onReady?: () => void;
}

const mockString =
  'This is an email test support@google.com. This a phone number test +542234751111 (+54)2234751111 542234751111 2234751111 475-1111 4751111. This is a url test http://www.google.com --- google.com/search?q=google+search';

const Notes: React.FC<NotesProps> = ({ value, onReady }) => {
  const content = !config.MOCKS.NOTES || value ? value : mockString;
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
    <View style={{ paddingBottom: 10, paddingHorizontal: 30, backgroundColor: theme.colors.surface }}>
      <ReadMore numberOfLines={3} dataDetectorType="all" onReady={onReady}>
        <Paragraph>{content}</Paragraph>
      </ReadMore>
    </View>
  );
};

export default Notes;
