import React from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

import { styled } from 'src/paperTheme';
import { DraftPhoto } from 'src/types';

import CardFooter, { CommentInputProps } from './CardFooter';
import MoreButton from './MoreButton';

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

interface TextCardProps {
  id: number;
  name: string;
  description: string | null;
  commentInputProps: CommentInputProps;
  photos: DraftPhoto[];
  onTapPhoto: (index: number) => void;
  onTakePhoto: (uri: string, isFromGallery: boolean) => void;
}

const TextCard: React.FC<TextCardProps> = ({
  id,
  name,
  description,
  commentInputProps,
  photos,
  onTapPhoto,
  onTakePhoto,
}) => {
  return (
    <Container>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 10, paddingVertical: 10 }}>
          <Card.Title
            title={name}
            subtitle={description}
            titleNumberOfLines={0}
            subtitleNumberOfLines={0}
            style={{ flex: 1, marginRight: 10 }}
            subtitleStyle={{ fontSize: 14, margin: 0, padding: 0 }}
          />
          <MoreButton
            onTakePhoto={onTakePhoto}
            onDelete={() => {
              /* TODO: this */
            }}
            showCommentOption={false}
          />
        </View>
        <Card.Content>
          <CardFooter
            id={id}
            showComment
            commentInputProps={commentInputProps}
            photos={photos}
            onTapPhoto={onTapPhoto}
          />
        </Card.Content>
      </Card>
    </Container>
  );
};
export default TextCard;
