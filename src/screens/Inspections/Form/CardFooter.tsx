import React from 'react';
import { TextInput } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { FlatGrid } from 'react-native-super-grid';

import ImagePickerImage from 'src/components/ImagePickerImage';
import { styled } from 'src/paperTheme';
import { DraftPhoto } from 'src/types';

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

interface NumberCardProps {
  photos: DraftPhoto[];
  commentInputProps: TextInputProps;
}

const NumberCard: React.FC<NumberCardProps> = ({ photos, commentInputProps }) => {
  return (
    <Container>
      <TextInput
        style={{ marginBottom: 10 }}
        keyboardType="numeric"
        autoCapitalize="none"
        dense
        {...commentInputProps}
      />
      <FlatGrid
        itemDimension={90}
        data={photos}
        style={{ flex: 1 }}
        spacing={5}
        renderItem={({ item }) => (
          <ImagePickerImage
            uri={item.uri}
            style={{ aspectRatio: 1, borderRadius: 5 }}
            onError={(e) => console.warn('imagepicker error', JSON.stringify(e))}
          />
        )}
      />
    </Container>
  );
};

export default NumberCard;
