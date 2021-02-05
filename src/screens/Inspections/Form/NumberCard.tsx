import React from 'react';
import { View } from 'react-native';
import { Card, Text, TextInput } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';

import { styled } from 'src/paperTheme';
import { DraftPhoto, Rating } from 'src/types';

import CardFooter from './CardFooter';
import MoreButton from './MoreButton';

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

interface NumberCardProps {
  id: number;
  name: string;
  description: string | null;
  rating: Rating;
  numberInputProps: TextInputProps;
  commentInputProps: TextInputProps;
  photos: DraftPhoto[];
  onTapPhoto: (index: number) => void;
  onTakePhoto: (uri: string, isFromGallery: boolean) => void;
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
}) => {
  const prefix = Math.random() < 0.5 ? 'The room had' : rating.prefix;
  const suffix = Math.random() < 0.5 ? 'issues' : rating.suffix;

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
            subtitleStyle={{ fontSize: 14 }}
          />
          <MoreButton
            onTakePhoto={onTakePhoto}
            onDelete={() => {
              /* TODO: this */
            }}
          />
        </View>
        <Card.Content style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {!!prefix && <Text>{prefix}</Text>}
          <TextInput
            style={{ marginBottom: 10, flex: 1, marginHorizontal: 5 }}
            keyboardType="numeric"
            autoCapitalize="none"
            dense
            {...numberInputProps}
          />
          {!!suffix && <Text>{suffix}</Text>}
          <CardFooter id={id} commentInputProps={commentInputProps} photos={photos} onTapPhoto={onTapPhoto} />
        </Card.Content>
      </Card>
    </Container>
  );
};
export default NumberCard;
