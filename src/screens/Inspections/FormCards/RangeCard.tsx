import React, { useState } from 'react';
import { Button, Card, Menu, useTheme } from 'react-native-paper';
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

interface RangeCardProps extends BaseCardProps {
  selectedRangeChoice: RangeChoice | null;
  rangeChoices: RangeChoice[];
  onChoicePress: (choice: RangeChoice) => void;
}

const RangeCard: React.FC<RangeCardProps> = ({
  id,
  name,
  description,
  photos,
  selectedRangeChoice,
  rangeChoices,
  commentInputProps,
  onChoicePress,
  onTapPhoto,
  onTakePhoto,
  onAddComment,
  onDelete,
  showComment,
  allowDelete,
}) => {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const theme = useTheme();

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
          allowDelete={allowDelete}
        />
        <Card.Content>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <Button
                onPress={openMenu}
                mode="contained"
                dark
                color={selectedRangeChoice?.deficient ? theme.colors.deficient : theme.colors.primary}
              >
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
                titleStyle={{ color: choice.deficient ? theme.colors.deficient : theme.colors.text }}
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
export default RangeCard;
