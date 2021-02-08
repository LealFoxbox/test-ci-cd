import React from 'react';
import { ListRenderItem } from 'react-native';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { FormikProps } from 'formik';
import { set } from 'lodash/fp';

import { updateDraftFieldsAction } from 'src/pullstate/actions';
import { DraftField, DraftPhoto, PointsRating, Rating } from 'src/types';

import TextCard from '../FormCards/TextCard';
import NumberCard from '../FormCards/NumberCard';
import PointsCard from '../FormCards/PointsCard';
import { CommentInputProps } from '../FormCards/CardFooter';

export const createRenderCard = (
  { values, setFieldValue }: FormikProps<Record<string, DraftField>>,
  {
    setExpandedPhoto,
    assignmentId,
    ratings,
    theme,
  }: {
    setExpandedPhoto: React.Dispatch<React.SetStateAction<{ photos: string[]; index: number }>>;
    assignmentId: number;
    ratings: Record<string, Rating>;
    theme: ReactNativePaper.Theme;
  },
): ListRenderItem<DraftField> => {
  return ({ item: draftField }) => {
    const fieldValue = values[draftField.formFieldId];
    const rating = ratings[fieldValue.rating_id];

    const handleBlur = () => updateDraftFieldsAction(assignmentId, values);
    const handleTapPhoto = (index: number) => setExpandedPhoto({ index, photos: draftField.photos.map((p) => p.uri) });
    const handleTakePhoto = (uri: string, isFromGallery: boolean) => {
      const newPhoto: DraftPhoto = {
        isFromGallery,
        uri,
        latitude: null, // Latitude where the inspection was started or first available location coordinates
        longitude: null, // Longitude where the inspection was started or first available location coordinates
        created_at: Date.now(), // timestamp in format "2020-01-08T14:52:56-07:00",
      };

      setFieldValue(`${fieldValue.formFieldId}`, set('photos', fieldValue.photos.concat([newPhoto]), fieldValue));

      const newValues = set(`${draftField.formFieldId}.photos`, fieldValue.photos.concat([newPhoto]), values);
      updateDraftFieldsAction(assignmentId, newValues);
    };
    const handleAddComment = () => {
      setFieldValue(`${fieldValue.formFieldId}`, set('comment', '', fieldValue));
    };

    const commentInputProps: CommentInputProps = {
      value: fieldValue.comment,
      onChangeText: (value) => {
        setFieldValue(`${fieldValue.formFieldId}`, { ...fieldValue, comment: value });
      },
      onBlur: handleBlur,
      placeholder: 'Add a comment...',
      theme,
    };

    if (fieldValue.ratingTypeId === 6) {
      // NumberCard
      const numberInputProps: TextInputProps = {
        value: fieldValue.number_choice || '',
        onChangeText: (value) => {
          setFieldValue(`${fieldValue.formFieldId}`, {
            ...fieldValue,
            number_choice: value,
          });
        },
        onBlur: handleBlur,
        label: fieldValue.name,
        theme,
      };

      return (
        <NumberCard
          id={fieldValue.formFieldId}
          key={fieldValue.formFieldId}
          rating={rating}
          name={fieldValue.name}
          description={fieldValue.description}
          commentInputProps={commentInputProps}
          numberInputProps={numberInputProps}
          photos={fieldValue.photos}
          onTapPhoto={handleTapPhoto}
          onTakePhoto={handleTakePhoto}
          onAddComment={handleAddComment}
          showComment={fieldValue.comment !== null}
        />
      );
    }

    if (fieldValue.ratingTypeId === 7) {
      return (
        <PointsCard
          id={fieldValue.formFieldId}
          key={fieldValue.formFieldId}
          name={fieldValue.name}
          description={fieldValue.description}
          commentInputProps={commentInputProps}
          photos={fieldValue.photos}
          onTapPhoto={handleTapPhoto}
          onTakePhoto={handleTakePhoto}
          points={fieldValue.points}
          rating={rating as PointsRating}
          onChoicePress={(choice) => {
            setFieldValue(`${fieldValue.formFieldId}`, {
              ...fieldValue,
              points: choice.points,
            });
          }}
          onAddComment={handleAddComment}
          showComment={fieldValue.comment !== null}
        />
      );
    }

    // TextCard
    return (
      <TextCard
        id={fieldValue.formFieldId}
        key={fieldValue.formFieldId}
        name={fieldValue.name}
        description={fieldValue.description}
        commentInputProps={commentInputProps}
        photos={fieldValue.photos}
        onTapPhoto={handleTapPhoto}
        onTakePhoto={handleTakePhoto}
      />
    );
  };
};
