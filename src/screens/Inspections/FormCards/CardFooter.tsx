import React from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Card, TextInput, useTheme } from 'react-native-paper';
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

interface CardFooterProps {
  id: number;
  photos: DraftPhoto[];
  commentInputProps: CommentInputProps;
  onTapPhoto: (index: number) => void;
  showComment: boolean;
  isSignature?: boolean;
}

const CardFooter: React.FC<CardFooterProps> = ({
  id,
  photos,
  commentInputProps,
  showComment,
  isSignature,
  onTapPhoto,
}) => {
  const theme = useTheme();

  return (
    <Card.Content>
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
            <TouchableOpacity
              accessibilityRole="imagebutton"
              onPress={() => onTapPhoto(photos.indexOf(item))}
              style={{ elevation: 2, backgroundColor: theme.colors.surface, margin: 0, borderRadius: 5 }}
            >
              <ImagePickerImage
                uri={`file://${item.uri}`}
                style={{ aspectRatio: 1, borderRadius: 5 }}
                onError={(e) => console.warn('imagepicker error: ', e.nativeEvent.error)}
              />
              {isSignature && (
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0,
                    borderRadius: 5,
                    backgroundColor: theme.colors.text,
                    opacity: 0.1,
                  }}
                />
              )}
            </TouchableOpacity>
          )}
        />
      </Container>
    </Card.Content>
  );
};

export default CardFooter;
