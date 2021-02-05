import React, { useState } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Button, Text, useTheme } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { Formik, FormikProps } from 'formik';
import { fromPairs, memoize, set } from 'lodash/fp';

import ExpandedGallery from 'src/components/ExpandedGallery';
import Notes from 'src/components/Notes';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { updateDraftFieldsAction } from 'src/pullstate/actions';
import { INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import { DraftField, DraftForm, DraftPhoto, Rating } from 'src/types';

import TextCard from './TextCard';
import NumberCard from './NumberCard';

const getInitialValues = memoize((draft: DraftForm) => {
  return fromPairs(draft.fields.map((field) => [field.formFieldId, field]));
});

const createRenderCard = (
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
    const rating = ratings[fieldValue.ratingTypeId];

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

    const commentInputProps: TextInputProps = {
      value: fieldValue.comment || '',
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

const EditFormScreen: React.FC<{}> = () => {
  const {
    params: { formId, structureId, assignmentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM>>();

  const [expandedPhoto, setExpandedPhoto] = useState<{ photos: string[]; index: number }>({
    photos: [],
    index: -1,
  });
  const userData = PersistentUserStore.useState((s) => s.userData);
  const draft = PersistentUserStore.useState((s) => (assignmentId ? s.drafts[assignmentId] : undefined));
  const ratings = PersistentUserStore.useState((s) => s.ratings);
  const theme = useTheme();

  const navigation = useNavigation();

  if (!userData || !formId || !structureId || !assignmentId || !draft) {
    return <View />;
  }

  const initialValues = getInitialValues(draft);

  const submit = () => {
    PersistentUserStore.update((s) => {
      s.pendingUploads.push(s.drafts[assignmentId]);
      delete s.drafts[assignmentId];
    });
    navigation.goBack();
  };

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1, justifyContent: 'center' }}>
      <ExpandedGallery
        images={expandedPhoto.photos.map((uri, index) => ({
          source: { uri: `file://${uri}` },
          index,
        }))}
        imageIndex={expandedPhoto.index !== -1 ? expandedPhoto.index : 0}
        isVisible={expandedPhoto.index !== -1}
        onClose={() => setExpandedPhoto((s) => ({ ...s, index: -1 }))}
        renderFooter={(_currentImage: any) => (
          <View>
            <Text>.</Text>
          </View>
        )}
      />
      <Formik initialValues={initialValues} onSubmit={submit}>
        {(formikProps) => (
          <FlatList
            contentContainerStyle={{
              justifyContent: 'flex-start',
            }}
            ListHeaderComponent={<Notes value={draft.notes} isCard />}
            ListFooterComponent={() => (
              <Button
                onPress={formikProps.handleSubmit}
                mode="contained"
                dark
                style={{ width: 120, alignSelf: 'flex-end', marginTop: 10, marginBottom: 20, marginHorizontal: 10 }}
              >
                Submit
              </Button>
            )}
            data={draft.fields}
            keyExtractor={(item) => `${item.formFieldId}`}
            renderItem={createRenderCard(formikProps, { setExpandedPhoto, assignmentId, ratings, theme })}
          />
        )}
      </Formik>
    </View>
  );
};

export default EditFormScreen;
