import React from 'react';
import { Card, Text, TextInput } from 'react-native-paper';
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
  onAddComment,
  onDelete,
  showComment,
}) => {
  return (
    <Container>
      <Card>
        <CardHeader
          name={name}
          description={description}
          onTakePhoto={onTakePhoto}
          onAddComment={onAddComment}
          onDelete={onDelete}
          showCommentOption={!showComment}
          allowPhotos
        />
        <Card.Content style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {!!rating.prefix && <Text>{rating.prefix}</Text>}
          <TextInput
            style={{ marginBottom: 10, flex: 1, marginHorizontal: 5 }}
            keyboardType="numeric"
            autoCapitalize="none"
            placeholder="Enter a number"
            dense
            {...numberInputProps}
          />
          {!!rating.suffix && <Text>{rating.suffix}</Text>}
        </Card.Content>
        <CardFooter
          id={id}
          commentInputProps={commentInputProps}
          photos={photos}
          onTapPhoto={onTapPhoto}
          showComment={showComment}
        />
      </Card>
    </Container>
  );
};
export default NumberCard;
