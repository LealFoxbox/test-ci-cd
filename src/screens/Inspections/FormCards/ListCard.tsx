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
  onDelete,
  onAddComment,
  showComment,
  ratingName,
  allowDelete,
}) => {
  return (
    <Container>
      <Card>
        <CardHeader
          name={name}
          description={description}
          onAddComment={onAddComment}
          onTakePhoto={onTakePhoto}
          onDelete={onDelete}
          showCommentOption={!showComment}
          allowPhotos
          allowDelete={allowDelete}
        />
        <Card.Content>
          <Button onPress={onOpen} mode="contained" dark>
            {ratingName}
          </Button>
        </Card.Content>
        <CardFooter
          id={id}
          commentInputProps={commentInputProps}
          showComment={showComment}
          photos={photos}
          onTapPhoto={onTapPhoto}
          isSignature
        />
      </Card>
    </Container>
  );
};
export default ListCard;
