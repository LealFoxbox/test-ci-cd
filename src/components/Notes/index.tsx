import React from 'react';
import { Card, Paragraph } from 'react-native-paper';

import config from 'src/config';

import ReadMore from './ReadMore';

interface NotesProps {
  value?: string | null;
}

const mockString =
  'This is an email test support@google.com. This a phone number test +542234751111 (+54)2234751111 542234751111 2234751111 475-1111 4751111. This is a url test http://www.google.com --- google.com/search?q=google+search';

const Notes: React.FC<NotesProps> = ({ value }) => {
  const content = !config.MOCKS.NOTES || value ? value : mockString;
  if (!content) {
    return null;
  }

  return (
    <Card style={{ margin: 10 }}>
      <Card.Content style={{ paddingHorizontal: 30 }}>
        <ReadMore numberOfLines={2} dataDetectorType="all">
          <Paragraph>{content}</Paragraph>
        </ReadMore>
      </Card.Content>
    </Card>
  );
};

export default Notes;
