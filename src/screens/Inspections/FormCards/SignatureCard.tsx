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
  onDelete,
  onAddComment,
  showComment,
}) => {
  return (
    <Container>
      <Card>
        <CardHeader
          name={name}
          description={description}
          onAddComment={onAddComment}
          onDelete={onDelete}
          showCommentOption={!showComment}
          allowPhotos={false}
        />
        <Card.Content>
          <Button onPress={onOpen} mode="contained" dark>
            Tap to sign
          </Button>
        </Card.Content>
        <CardFooter
          id={id}
          commentInputProps={commentInputProps}
          showComment={showComment}
          photos={photos}
          onTapPhoto={onTapPhoto}
        />
      </Card>
    </Container>
  );
};
export default SignatureCard;
