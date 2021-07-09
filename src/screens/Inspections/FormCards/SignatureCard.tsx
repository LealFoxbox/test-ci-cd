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
}

const SignatureCard: React.FC<SignatureCardProps> = ({
  id,
  name,
  description,
  commentInputProps,
  photos,
  onOpen,
  onTapPhoto,
  onDeletePhoto,
  onDelete,
  onAddComment,
  showComment,
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
          onDelete={onDelete}
          showCommentOption={!showComment}
          allowPhotos={false}
          allowDelete={allowDelete}
          isReadonly={isReadonly}
        />
        <Card.Content>
          <Button onPress={onOpen} mode="contained" dark disabled={isReadonly}>
            Tap to sign
          </Button>
        </Card.Content>
        <CardFooter
          id={id}
          commentInputProps={commentInputProps}
          showComment={showComment}
          photos={photos}
          onTapPhoto={onTapPhoto}
          onDeletePhoto={onDeletePhoto}
          isSignature
          isReadonly={isReadonly}
        />
      </Card>
    </Container>
  );
};
export default SignatureCard;
