import React from 'react';
import { Card } from 'react-native-paper';

import { styled } from 'src/paperTheme';

import CardFooter from './CardFooter';
import CardHeader from './CardHeader';
import { TextCardProps } from './propTypes';

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

const TextCard: React.FC<TextCardProps> = ({
  id,
  name,
  description,
  commentInputProps,
  photos,
  onTapPhoto,
  onTakePhoto,
  onDelete,
}) => {
  return (
    <Container>
      <Card>
        <CardHeader
          name={name}
          description={description}
          onTakePhoto={onTakePhoto}
          onDelete={onDelete}
          showCommentOption={false}
          allowPhotos
        />
        <CardFooter id={id} showComment commentInputProps={commentInputProps} photos={photos} onTapPhoto={onTapPhoto} />
      </Card>
    </Container>
  );
};
export default TextCard;
