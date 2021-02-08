import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { TextInput } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { FlatGrid } from 'react-native-super-grid';

import ImagePickerImage from 'src/components/ImagePickerImage';
import { styled } from 'src/paperTheme';
import { DraftPhoto } from 'src/types';

export interface CommentInputProps extends Omit<TextInputProps, 'value'> {
  value: string | null;
}

const Container = styled.View`
  margin-top: 10px;
  padding-top: 10px;
`;

interface NumberCardProps {
  id: number;
  photos: DraftPhoto[];
  commentInputProps: CommentInputProps;
  onTapPhoto: (index: number) => void;
  showComment: boolean;
}

const CardFooter: React.FC<NumberCardProps> = ({ id, photos, commentInputProps, showComment, onTapPhoto }) => {
  return (
    <Container>
      {showComment && (
        <TextInput
          style={{ marginBottom: 10 }}
          keyboardType="default"
          autoCapitalize="none"
          dense
          {...commentInputProps}
          value={commentInputProps.value || ''}
        />
      )}
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

export default CardFooter;
