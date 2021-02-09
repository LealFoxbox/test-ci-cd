import React from 'react';
import { ListRenderItem } from 'react-native';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { FormikProps } from 'formik';
import { find, set } from 'lodash/fp';

import { updateDraftFieldsAction } from 'src/pullstate/actions';
import { DraftField, DraftPhoto, NumberRating, RangeChoice, Rating } from 'src/types';

import TextCard from '../FormCards/TextCard';
import NumberCard from '../FormCards/NumberCard';
import { CommentInputProps } from '../FormCards/CardFooter';
import RangeCard from '../FormCards/RangeCard';
import SignatureCard from '../FormCards/SignatureCard';

export const createRenderCard = (
  { values, setFieldValue }: FormikProps<Record<string, DraftField>>,
  {
    setExpandedPhoto,
    assignmentId,
    ratings,
    theme,
    goToSignature,
  }: {
    setExpandedPhoto: React.Dispatch<React.SetStateAction<{ photos: string[]; index: number }>>;
    assignmentId: number;
    ratings: Record<string, Rating>;
    theme: ReactNativePaper.Theme;
    goToSignature: (formFieldId: number) => void;
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

      const newValues = set(`${draftField.formFieldId}.photos`, fieldValue.photos.concat([newPhoto]), values);

      setFieldValue(`${fieldValue.formFieldId}`, newValues[fieldValue.formFieldId]);
      updateDraftFieldsAction(assignmentId, newValues);
    };
    const handleAddComment = () => {
      setFieldValue(`${fieldValue.formFieldId}`, set('comment', '', fieldValue));
    };
    const handleDelete = () => {
      // TODO:
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

    const textCardProps = {
      id: fieldValue.formFieldId,
      key: fieldValue.formFieldId,
      name: fieldValue.name,
      description: fieldValue.description,
      commentInputProps: commentInputProps,
      photos: fieldValue.photos,
      onTapPhoto: handleTapPhoto,
      onTakePhoto: handleTakePhoto,
      onDelete: handleDelete,
    };

    const baseCardProps = {
      ...textCardProps,
      onAddComment: handleAddComment,
      showComment: fieldValue.comment !== null,
    };

    if (fieldValue.ratingTypeId === 6) {
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

      return <NumberCard {...baseCardProps} rating={rating as NumberRating} numberInputProps={numberInputProps} />;
    }

    if (fieldValue.ratingTypeId === 5) {
      return <SignatureCard {...baseCardProps} onOpen={() => goToSignature(fieldValue.formFieldId)} />;
    }

    if (fieldValue.ratingTypeId === 7 || fieldValue.ratingTypeId === 1) {
      const rangeChoices = rating.range_choices as RangeChoice[];
      let selectedRangeChoice: RangeChoice | undefined;
      if (fieldValue.ratingTypeId === 7) {
        selectedRangeChoice =
          fieldValue.points !== null
            ? find({ points: fieldValue.points }, rangeChoices)
            : find({ default: true }, rangeChoices);
      } else {
        selectedRangeChoice =
          fieldValue.score !== null
            ? find({ score: fieldValue.score }, rangeChoices)
            : find({ default: true }, rangeChoices);
      }

      return (
        <RangeCard
          {...baseCardProps}
          selectedRangeChoice={selectedRangeChoice || null}
          deficient={fieldValue.deficient}
          rangeChoices={rangeChoices}
          onChoicePress={(choice) => {
            const newValues =
              fieldValue.ratingTypeId === 7
                ? set(`${draftField.formFieldId}.points`, choice.points, values)
                : set(`${draftField.formFieldId}.score`, choice.score, values);

            setFieldValue(`${fieldValue.formFieldId}`, newValues[draftField.formFieldId]);
            updateDraftFieldsAction(assignmentId, newValues);
          }}
        />
      );
    }

    return <TextCard {...textCardProps} />;
  };
};
