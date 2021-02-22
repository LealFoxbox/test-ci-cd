import React from 'react';
import { Paragraph, Title } from 'react-native-paper';

import { styled } from 'src/paperTheme';

export const BlankContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 30px;
`;

const BlankScreen: React.FC = () => {
  return (
    <BlankContentContainer>
      <Title>No Uploads</Title>
      <Paragraph style={{ marginTop: 0 }}>You don't have any uploads.</Paragraph>
    </BlankContentContainer>
  );
};

export default BlankScreen;
