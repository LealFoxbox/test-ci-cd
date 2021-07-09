import React from 'react';
import { Button, Card } from 'react-native-paper';

import { styled } from 'src/paperTheme';

import CardFooter from './CardFooter';
import CardHeader from './CardHeader';
import { BaseCardProps } from './propTypes';

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

interface SignatureCardProps extends BaseCardProps {
  onOpen: () => void;
  ratingName: string;
}

const ListCard: React.FC<SignatureCardProps> = ({
  id,
  name,
  description,
  commentInputProps,
  photos,
  onOpen,
  onTapPhoto,
  onTakePhoto,
  onDeletePhoto,
  onDelete,
  onAddComment,
  showComment,
  ratingName,
  allowDelete,
  isReadonly,
  onTakeCamera,
}) => {
  return (
    <Container>
      <Card>
        <CardHeader
          onTakeCamera={onTakeCamera}
          name={name}
          description={description}
          onAddComment={onAddComment}
          onTakePhoto={onTakePhoto}
          onDelete={onDelete}
          showCommentOption={!showComment}
          isReadonly={isReadonly}
          allowDelete={allowDelete}
          allowPhotos
        />
        <Card.Content>
          <Button onPress={onOpen} mode="contained" dark disabled={isReadonly}>
            {ratingName}
          </Button>
        </Card.Content>
        <CardFooter
          id={id}
          commentInputProps={commentInputProps}
          showComment={showComment}
          photos={photos}
          onTapPhoto={onTapPhoto}
          onDeletePhoto={onDeletePhoto}
          isReadonly={isReadonly}
          isSignature
        />
      </Card>
    </Container>
  );
};
export default ListCard;
