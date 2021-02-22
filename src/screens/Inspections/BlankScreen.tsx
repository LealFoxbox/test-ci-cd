import React from 'react';
import { Paragraph, Title } from 'react-native-paper';

import { styled } from 'src/paperTheme';
import { PersistentUserStore } from 'src/pullstate/persistentStore';

export const BlankContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 30px;
`;

const BlankScreen: React.FC = () => {
  const userData = PersistentUserStore.useState((s) => s.userData);

  return (
    <BlankContentContainer>
      <Title>No Areas Found</Title>
      <Paragraph style={{ marginTop: 0 }}>You don't have any areas of access.</Paragraph>
      <Paragraph style={{ marginTop: 0 }}>Contact {userData?.account.name} for help.</Paragraph>
    </BlankContentContainer>
  );
};

export default BlankScreen;
