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
  onDeletePhoto,
  onAddComment,
  onDelete,
  isReadonly,
  showComment,
  allowDelete,
  onTakeCamera,
}) => {
  const [visible, setVisible] = useState(false);
  const [disable, setDisable] = useState(false);
  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const theme = useTheme();

  const openButton = (
    <Button
      onPress={openMenu}
      mode="contained"
      dark
      disabled={disable}
      color={selectedRangeChoice?.deficient ? theme.colors.deficient : theme.colors.primary}
    >
      {selectedRangeChoice?.label}
    </Button>
  );

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
          allowDelete={allowDelete}
          isReadonly={disable}
          allowPhotos
          photoCallBack={setDisable}
          onTakeCamera={onTakeCamera}
        />
        <Card.Content>
          {isReadonly && openButton}
          {!isReadonly && (
            <Menu visible={visible} onDismiss={closeMenu} anchor={openButton}>
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
          )}
        </Card.Content>
        <CardFooter
          id={id}
          commentInputProps={commentInputProps}
          showComment={showComment}
          photos={photos}
          onTapPhoto={onTapPhoto}
          onDeletePhoto={onDeletePhoto}
          isReadonly={isReadonly}
        />
      </Card>
    </Container>
  );
};
export default RangeCard;
