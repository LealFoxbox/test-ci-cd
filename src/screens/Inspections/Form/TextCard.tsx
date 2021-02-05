import React from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';

import { styled } from 'src/paperTheme';
import { DraftPhoto } from 'src/types';

import CardFooter from './CardFooter';
import MoreButton from './MoreButton';

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

interface TextCardProps {
  id: number;
  name: string;
  description: string | null;
  commentInputProps: TextInputProps;
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
            style={{ flex: 1, marginRight: 10 }}
            titleNumberOfLines={0}
            subtitleNumberOfLines={0}
            title={name}
            subtitle={description}
          />
          <MoreButton
            onTakePhoto={onTakePhoto}
            onDelete={() => {
              /* TODO: this */
            }}
          />
        </View>
        <CardFooter id={id} commentInputProps={commentInputProps} photos={photos} onTapPhoto={onTapPhoto} />
      </Card>
    </Container>
  );
};
export default TextCard;
