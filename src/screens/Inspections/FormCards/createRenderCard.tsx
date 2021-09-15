import React from 'react';
import { ListRenderItem } from 'react-native';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { FormikProps } from 'formik';
import { differenceBy, find, set } from 'lodash/fp';
import RNFS from 'react-native-fs';
import { fromPairs } from 'lodash';

import { getFormFieldId, updateDraftFieldsAction } from 'src/pullstate/formActions';
import { CategoryField, DraftField, DraftPhoto, NumberRating, RangeChoice, Rating, SelectRating } from 'src/types';
import getCurrentPosition from 'src/utils/getCurrentPosition';
import { isCorrectNumberCard } from 'src/screens/Inspections/FormScreen/validation';
import SectionHeader from 'src/screens/Inspections/FormCards/SectionHeader';

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
  openDeleteSection: ({
    categoryId,
    handleRemove,
  }: {
    categoryId?: string;
    handleRemove: (categoryId: string | number | null) => void;
  }) => () => void;
  goToCamera?: (formFieldId: number, callback: () => void) => void;
  goToRatingChoices: (params: { title: string; ratingId: number; formFieldId: number }) => void;
  showDeleteIcon: boolean;
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
    goToCamera,
    goToRatingChoices,
    openDeleteSection,
    showDeleteIcon,
  }: CreateRenderCardParams,
): ListRenderItem<DraftField | string | CategoryField> => {
  return ({ item: draftField }) => {
    if (typeof draftField === 'string') {
      if (!draftField) {
        return null;
      }
      return <SectionHeader title={draftField} theme={theme} showDeleteIcon={false} />;
    }

    const handleDeleteSection = (categoryId: string | number | null) => {
      // const newValues = set(`${getFormFieldId(draftField)}.deleted`, true, values);
      const fields = Object.values(values ?? {}).map((f) => {
        if (f.category_id === Number(categoryId)) {
          const newValues = set(`${getFormFieldId(f)}.deleted`, true, values);
          setFieldValue(`${getFormFieldId(f)}`, newValues[getFormFieldId(f)]);
          return {
            ...f,
            deleted: true,
          };
        } else {
          return f;
        }
      });
      const newValues = fromPairs(fields.map((f) => [`${getFormFieldId(f)}`, f]));
      // prevented the user from deleting every single field
      updateDraftFieldsAction(assignmentId, newValues);
    };

    if (draftField.ratingTypeId === 100) {
      return (
        <SectionHeader
          title={draftField.name}
          theme={theme}
          onPress={openDeleteSection({
            categoryId: draftField.category_id,
            handleRemove: handleDeleteSection,
          })}
          showDeleteIcon={showDeleteIcon}
        />
      );
    }

    const fieldValue = values[getFormFieldId(draftField)];
    const rating = ratings[fieldValue.rating_id] as Rating | undefined;

    const handleBlur = () => updateDraftFieldsAction(assignmentId, values);
    const handleTapPhoto = (index: number) => setExpandedPhoto({ index, photos: draftField.photos.map((p) => p.uri) });
    const handleCamera = (callback: () => void) => {
      if (typeof goToCamera === 'function') {
        goToCamera(getFormFieldId(fieldValue), callback);
      }
    };
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

      const newValues = set(`${getFormFieldId(draftField)}.photos`, fieldValue.photos.concat([newPhoto]), values);

      setFieldValue(`${getFormFieldId(fieldValue)}`, newValues[getFormFieldId(fieldValue)]);
      updateDraftFieldsAction(assignmentId, newValues);
    };
    const handleDeletePhoto = async (photo: DraftPhoto) => {
      const newPhotos = differenceBy({ uri: photo.uri }, fieldValue.photos, [photo]);
      const newValues = set(`${getFormFieldId(draftField)}.photos`, newPhotos, values);

      try {
        await RNFS.unlink(photo.uri);
      } catch (error) {
        console.warn('[APP] UNLINK');
      }

      setFieldValue(`${getFormFieldId(fieldValue)}`, newValues[getFormFieldId(fieldValue)]);
      updateDraftFieldsAction(assignmentId, newValues);
    };
    const handleAddComment = () => {
      setFieldValue(`${getFormFieldId(fieldValue)}`, set('comment', '', fieldValue));
    };
    const handleDelete = () => {
      const newValues = set(`${getFormFieldId(draftField)}.deleted`, true, values);

      // prevented the user from deleting every single field
      setFieldValue(`${getFormFieldId(fieldValue)}`, newValues[getFormFieldId(fieldValue)]);
      updateDraftFieldsAction(assignmentId, newValues);
    };

    const allowDelete = Object.values(values).filter((v) => !v.deleted).length > 1;

    const commentInputProps: CommentInputProps = {
      value: fieldValue.comment,
      onChangeText: (value) => {
        setFieldValue(`${getFormFieldId(fieldValue)}`, { ...fieldValue, comment: value });
      },
      onBlur: handleBlur,
      placeholder: 'Add a comment...',
      theme,
    };

    const textCardProps = {
      id: getFormFieldId(fieldValue),
      key: getFormFieldId(fieldValue),
      name: fieldValue.name,
      description: fieldValue.description,
      commentInputProps: commentInputProps,
      photos: fieldValue.photos,
      onTapPhoto: handleTapPhoto,
      onTakePhoto: handleTakePhoto,
      onTakeCamera: handleCamera,
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
          setFieldValue(`${getFormFieldId(fieldValue)}`, {
            ...fieldValue,
            number_choice: value,
          });
        },
        onBlur: handleBlur,
        theme,
      };

      return (
        <NumberCard
          {...baseCardProps}
          rating={rating as NumberRating}
          numberInputProps={numberInputProps}
          error={!isCorrectNumberCard(numberInputProps.value)}
          errorMessage={'Incorrect format.'}
        />
      );
    }

    if (fieldValue.ratingTypeId === 5) {
      return (
        <SignatureCard
          {...baseCardProps}
          onOpen={() => {
            goToSignature(getFormFieldId(fieldValue));
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
              formFieldId: getFormFieldId(fieldValue),
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
            const newValues = set(`${getFormFieldId(draftField)}.selectedChoice`, choice, values);

            setFieldValue(`${getFormFieldId(fieldValue)}`, newValues[getFormFieldId(draftField)]);
            updateDraftFieldsAction(assignmentId, newValues);
          }}
        />
      );
    }

    return <TextCard {...textCardProps} />;
  };
};
