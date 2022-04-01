import React, { useState } from 'react';
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
  onDeletePhoto,
  onDelete,
  allowDelete,
  isReadonly,
  onTakeCamera,
}) => {
  const [disable, setDisable] = useState(false);
  return (
    <Container>
      <Card>
        <CardHeader
          onTakeCamera={onTakeCamera}
          name={name}
          photoCallBack={setDisable}
          description={description}
          onTakePhoto={onTakePhoto}
          onDelete={onDelete}
          showCommentOption={false}
          allowPhotos
          allowDelete={allowDelete}
          isReadonly={isReadonly}
        />
        <CardFooter
          id={id}
          showComment
          commentInputProps={commentInputProps}
          photos={photos}
          onTapPhoto={onTapPhoto}
          onDeletePhoto={onDeletePhoto}
          isReadonly={disable}
        />
      </Card>
    </Container>
  );
};
export default TextCard;
