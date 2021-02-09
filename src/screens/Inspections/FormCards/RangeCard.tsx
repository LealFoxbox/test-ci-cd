import React, { useState } from 'react';
import { Button, Card, Menu } from 'react-native-paper';
import { sortBy } from 'lodash/fp';

import { styled } from 'src/paperTheme';
import { RangeChoice } from 'src/types';

import CardFooter from './CardFooter';
import CardHeader from './CardHeader';
import { BaseCardProps } from './propTypes';

const Container = styled.View`
  margin: 10px;
  padding-top: 10px;
`;

interface ScoreCardProps extends BaseCardProps {
  selectedRangeChoice: RangeChoice | null;
  deficient: boolean | null;
  rangeChoices: RangeChoice[];
  onChoicePress: (choice: RangeChoice) => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  id,
  name,
  description,
  photos,
  selectedRangeChoice,
  // deficient,
  rangeChoices,
  commentInputProps,
  onChoicePress,
  onTapPhoto,
  onTakePhoto,
  onAddComment,
  onDelete,
  showComment,
}) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  return (
    <Container>
      <Card>
        <CardHeader
          name={name}
          description={description}
          onTakePhoto={onTakePhoto}
          onAddComment={onAddComment}
          onDelete={onDelete}
          showCommentOption={!showComment}
          allowPhotos
        />
        <Card.Content>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <Button onPress={openMenu} mode="contained" dark>
                {selectedRangeChoice?.label}
              </Button>
            }
          >
            {sortBy('position', rangeChoices).map((choice) => (
              <Menu.Item
                key={choice.id}
                onPress={() => {
                  closeMenu();
                  onChoicePress(choice);
                }}
                title={choice.label}
              />
            ))}
          </Menu>
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
export default ScoreCard;
