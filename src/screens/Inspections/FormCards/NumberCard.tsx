import React from 'react';
import { View } from 'react-native';
import { Card, HelperText, Text, TextInput } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';

import { styled } from 'src/paperTheme';
import { NumberRating } from 'src/types';

import CardFooter from './CardFooter';
import CardHeader from './CardHeader';
import { BaseCardProps } from './propTypes';

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

interface NumberCardProps extends BaseCardProps {
  rating: NumberRating;
  numberInputProps: TextInputProps;
}

const NumberCard: React.FC<NumberCardProps> = ({
  id,
  name,
  description,
  rating,
  photos,
  numberInputProps,
  commentInputProps,
  onTapPhoto,
  onTakePhoto,
  onDeletePhoto,
  onAddComment,
  onDelete,
  isReadonly,
  showComment,
  allowDelete,
  error,
  errorMessage,
  onTakeCamera,
}) => {
  return (
    <Container>
      <Card>
        <CardHeader
          onTakeCamera={onTakeCamera}
          name={name}
          description={description}
          onTakePhoto={onTakePhoto}
          onAddComment={onAddComment}
          onDelete={onDelete}
          showCommentOption={!showComment}
          allowPhotos
          allowDelete={allowDelete}
          isReadonly={isReadonly}
        />
        <Card.Content style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {!!rating?.prefix && <Text>{rating.prefix}</Text>}
          <View style={{ marginHorizontal: 5 }}>
            <TextInput
              style={{ flex: 1 }}
              keyboardType="decimal-pad"
              autoCapitalize="none"
              placeholder="Enter a number"
              dense
              {...numberInputProps}
              disabled={isReadonly}
            />
            {error && (
              <HelperText type="error" visible padding="none">
                {errorMessage}
              </HelperText>
            )}
          </View>
          {!!rating?.suffix && <Text>{rating.suffix}</Text>}
        </Card.Content>
        <CardFooter
          id={id}
          commentInputProps={commentInputProps}
          photos={photos}
          onTapPhoto={onTapPhoto}
          onDeletePhoto={onDeletePhoto}
          showComment={showComment}
          isReadonly={isReadonly}
        />
      </Card>
    </Container>
  );
};
export default NumberCard;
