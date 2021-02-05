import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
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
  id: number;
  photos: DraftPhoto[];
  commentInputProps: TextInputProps;
  onTapPhoto: (index: number) => void;
}

const NumberCard: React.FC<NumberCardProps> = ({ id, photos, commentInputProps, onTapPhoto }) => {
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
        listKey={`${id}`}
        spacing={5}
        renderItem={({ item }) => (
          <TouchableOpacity accessibilityRole="imagebutton" onPress={() => onTapPhoto(photos.indexOf(item))}>
            <ImagePickerImage
              uri={`file://${item.uri}`}
              style={{ aspectRatio: 1, borderRadius: 5 }}
              onError={(e) => console.warn('imagepicker error: ', e.nativeEvent.error)}
            />
          </TouchableOpacity>
        )}
      />
    </Container>
  );
};

export default NumberCard;
