import React from 'react';
import { View } from 'react-native';
import { Card } from 'react-native-paper';

import MoreButton, { MoreButtonProps } from './MoreButton';

interface CardHeaderProps extends MoreButtonProps {
  name: string;
  description: string | null;
  isReadonly: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  name,
  description,
  onTakePhoto,
  onAddComment,
  onDelete,
  showCommentOption,
  allowPhotos,
  allowDelete,
  isReadonly,
  onTakeCamera,
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 0, paddingVertical: 10 }}>
      <Card.Title
        style={{ flex: 1, marginRight: 10 }}
        titleNumberOfLines={0}
        subtitleNumberOfLines={0}
        title={name}
        subtitle={description}
        subtitleStyle={{ fontSize: 14 }}
      />
      {!isReadonly && (
        <MoreButton
          onTakePhoto={onTakePhoto}
          onAddComment={onAddComment}
          onDelete={onDelete}
          showCommentOption={showCommentOption}
          allowPhotos={allowPhotos}
          allowDelete={allowDelete}
          onTakeCamera={onTakeCamera}
        />
      )}
    </View>
  );
};

export default CardHeader;
