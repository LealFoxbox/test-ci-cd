import React from 'react';
import { ListRenderItem } from 'react-native';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { FormikProps } from 'formik';
import { differenceBy, find, set } from 'lodash/fp';
import RNFS from 'react-native-fs';
import { Title } from 'react-native-paper';

import { updateDraftFieldsAction } from 'src/pullstate/formActions';
import { DraftField, DraftPhoto, NumberRating, RangeChoice, Rating, SelectRating } from 'src/types';
import getCurrentPosition from 'src/utils/getCurrentPosition';

import TextCard from './TextCard';
import NumberCard from './NumberCard';
import { CommentInputProps } from './CardFooter';
import RangeCard from './RangeCard';
import SignatureCard from './SignatureCard';
import ListCard from './ListCard';

interface CreateRenderCardParams {
  setExpandedPhoto: React.Dispatch<React.SetStateAction<{ photos: string[]; index: number }>>;
  assignmentId: number;
  ratings: Record<string, Rating>;
  theme: ReactNativePaper.Theme;
  isReadonly: boolean;
  goToSignature: (formFieldId: number) => void;
  goToRatingChoices: (params: { title: string; ratingId: number; formFieldId: number }) => void;
}

function getListCardButtonName(listChoiceIds: number[], rating: SelectRating | undefined) {
  const { length } = listChoiceIds;

  if (length > 1) {
    return `${length} Selected`;
  }

  if (length === 0) {
    return rating?.name || '';
  }

  const choice = find({ id: listChoiceIds[0] }, rating?.range_choices);

  return choice?.name || 'Error in selection';
}

export const createRenderCard = (
  { values, setFieldValue }: FormikProps<Record<string, DraftField>>,
  {
    setExpandedPhoto,
    assignmentId,
    ratings,
    theme,
    isReadonly,
    goToSignature,
    goToRatingChoices,
  }: CreateRenderCardParams,
): ListRenderItem<DraftField | string> => {
  return ({ item: draftField }) => {
    if (typeof draftField === 'string') {
      if (!draftField) {
        return null;
      }

      return <Title style={{ marginLeft: 10 }}>{draftField}</Title>;
    }

    const fieldValue = values[draftField.formFieldId];
    const rating = ratings[fieldValue.rating_id] as Rating | undefined;

    const handleBlur = () => updateDraftFieldsAction(assignmentId, values);
    const handleTapPhoto = (index: number) => setExpandedPhoto({ index, photos: draftField.photos.map((p) => p.uri) });
    const handleTakePhoto = async ({ uri, fileName }: { uri: string; fileName: string }, isFromGallery: boolean) => {
      const coords = await getCurrentPosition();

      const newPhoto: DraftPhoto = {
        isFromGallery,
        uri,
        fileName,
        latitude: coords.latitude,
        longitude: coords.longitude,
        created_at: Date.now(),
      };

      const newValues = set(`${draftField.formFieldId}.photos`, fieldValue.photos.concat([newPhoto]), values);

      setFieldValue(`${fieldValue.formFieldId}`, newValues[fieldValue.formFieldId]);
      updateDraftFieldsAction(assignmentId, newValues);
    };
    const handleDeletePhoto = async (photo: DraftPhoto) => {
      const newPhotos = differenceBy({ uri: photo.uri }, fieldValue.photos, [photo]);
      const newValues = set(`${draftField.formFieldId}.photos`, newPhotos, values);

      try {
        await RNFS.unlink(photo.uri);
      } catch (error) {
        console.warn('[APP] UNLINK');
      }

      setFieldValue(`${fieldValue.formFieldId}`, newValues[fieldValue.formFieldId]);
      updateDraftFieldsAction(assignmentId, newValues);
    };
    const handleAddComment = () => {
      setFieldValue(`${fieldValue.formFieldId}`, set('comment', '', fieldValue));
    };
    const handleDelete = () => {
      const newValues = set(`${draftField.formFieldId}.deleted`, true, values);

      // prevented the user from deleting every single field
      setFieldValue(`${fieldValue.formFieldId}`, newValues[fieldValue.formFieldId]);
      updateDraftFieldsAction(assignmentId, newValues);
    };

    const allowDelete = Object.values(values).filter((v) => !v.deleted).length > 1;

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
      onDeletePhoto: handleDeletePhoto,
      onDelete: handleDelete,
      allowDelete,
      isReadonly,
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
        theme,
      };

      return <NumberCard {...baseCardProps} rating={rating as NumberRating} numberInputProps={numberInputProps} />;
    }

    if (fieldValue.ratingTypeId === 5) {
      return (
        <SignatureCard
          {...baseCardProps}
          onOpen={() => {
            goToSignature(fieldValue.formFieldId);
          }}
        />
      );
    }

    if (fieldValue.ratingTypeId === 8 || fieldValue.ratingTypeId === 9) {
      return (
        <ListCard
          {...baseCardProps}
          ratingName={getListCardButtonName(fieldValue.list_choice_ids, rating as SelectRating)}
          onOpen={() =>
            goToRatingChoices({
              title: rating?.name || '',
              ratingId: rating?.id || 0,
              formFieldId: fieldValue.formFieldId,
            })
          }
        />
      );
    }

    if (fieldValue.ratingTypeId === 7 || fieldValue.ratingTypeId === 1) {
      const rangeChoices = (rating?.range_choices || []) as RangeChoice[];

      const selectedRangeChoice = fieldValue.selectedChoice || find({ default: true }, rangeChoices) || null;

      return (
        <RangeCard
          {...baseCardProps}
          selectedRangeChoice={selectedRangeChoice}
          rangeChoices={rangeChoices}
          onChoicePress={(choice) => {
            const newValues = set(`${draftField.formFieldId}.selectedChoice`, choice, values);

            setFieldValue(`${fieldValue.formFieldId}`, newValues[draftField.formFieldId]);
            updateDraftFieldsAction(assignmentId, newValues);
          }}
        />
      );
    }

    return <TextCard {...textCardProps} />;
  };
};
