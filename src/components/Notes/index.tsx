import React from 'react';
import { Paragraph } from 'react-native-paper';

import config from 'src/config';

interface NotesProps {
  value?: string | null;
}

const Notes: React.FC<NotesProps> = ({ value }) => {
  if (!value) {
    if (!config.MOCKS.NOTES) {
      return null;
    }
    return (
      <Paragraph dataDetectorType="all" selectable>
        This is an email test support@google.com. This a phone number test +542234751111 (+54)2234751111 542234751111
        2234751111 475-1111 4751111. This is a url test http://www.google.com --- google.com/search?q=google+search
      </Paragraph>
    );
  }

  return (
    <Paragraph dataDetectorType="all" selectable>
      {value}
    </Paragraph>
  );
};

export default Notes;
