import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Menu } from 'react-native-paper';
import { find, sortBy } from 'lodash/fp';

import { styled } from 'src/paperTheme';
import { DraftPhoto, PointsRating, RangeChoice } from 'src/types';

import CardFooter, { CommentInputProps } from './CardFooter';
import MoreButton from './MoreButton';

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

interface NumberCardProps {
  id: number;
  name: string;
  description: string | null;
  points: number | null;
  rating: PointsRating;
  commentInputProps: CommentInputProps;
  photos: DraftPhoto[];
  onChoicePress: (choice: RangeChoice) => void;
  onTapPhoto: (index: number) => void;
  onTakePhoto: (uri: string, isFromGallery: boolean) => void;
  onAddComment: () => void;
  showComment: boolean;
}

const PointsCard: React.FC<NumberCardProps> = ({
  id,
  name,
  description,
  photos,
  points,
  rating,
  commentInputProps,
  onChoicePress,
  onTapPhoto,
  onTakePhoto,
  onAddComment,
  showComment,
}) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const rangeChoices = rating.range_choices;
  const selectedRangeChoice =
    points !== null ? find({ points }, rangeChoices) : find({ default: true }, Object.values(rangeChoices));

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
            onAddComment={onAddComment}
            showCommentOption={!showComment}
            onDelete={() => {
              /* TODO: this */
            }}
          />
        </View>
        <Card.Content style={{ flex: 1, flexDirection: 'column', alignItems: 'stretch' }}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <Button onPress={openMenu} mode="contained" dark>
                {selectedRangeChoice?.label}
              </Button>
            }
          >
            {sortBy('position', Object.values(rangeChoices)).map((choice) => (
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  onChoicePress(choice);
                }}
                title={choice.label}
              />
            ))}
          </Menu>
          <CardFooter
            id={id}
            commentInputProps={commentInputProps}
            showComment={showComment}
            photos={photos}
            onTapPhoto={onTapPhoto}
          />
        </Card.Content>
      </Card>
    </Container>
  );
};
export default PointsCard;
