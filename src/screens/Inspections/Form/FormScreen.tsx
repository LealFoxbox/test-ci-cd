import React from 'react';
import { View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Button, Title, useTheme } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { Formik } from 'formik';
import { fromPairs, memoize } from 'lodash/fp';

import { ScrollView } from 'src/components/KeyboardAware';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { updateDraftFieldsAction } from 'src/pullstate/actions';
import { INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import { DraftForm, DraftPhoto } from 'src/types';

import { FormContainer } from './styles';
import TextCard from './TextCard';
import NumberCard from './NumberCard';

const getInitialValues = memoize((draft: DraftForm) => {
  return fromPairs(draft.fields.map((field) => [field.line_item_id, field]));
});

const EditFormScreen: React.FC<{}> = () => {
  const {
    params: { formId, structureId, assignmentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM>>();

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
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      {!!draft.notes && <Title>{draft.notes}</Title>}
      <Formik initialValues={initialValues} onSubmit={submit}>
        {({ values, setFieldValue, handleSubmit }) => (
          <FormContainer>
            {draft.fields.map((draftField) => {
              const rating = ratings[draftField.ratingTypeId];
              const fieldValue = values[draftField.line_item_id];
              const commentInputProps: TextInputProps = {
                value: fieldValue.comment || '',
                onChangeText: (value) => {
                  setFieldValue(`${draftField.line_item_id}`, { ...fieldValue, comment: value });
                },
                onBlur: () => updateDraftFieldsAction(assignmentId, values),
                placeholder: 'Add a comment...',
                theme,
              };
              const handleTakePhoto = (uri: string, isFromGallery: boolean) => {
                const newPhoto: DraftPhoto = {
                  isFromGallery,
                  uri,
                  latitude: null, // Latitude where the inspection was started or first available location coordinates
                  longitude: null, // Longitude where the inspection was started or first available location coordinates
                  created_at: Date.now(), // timestamp in format "2020-01-08T14:52:56-07:00",
                };

                setFieldValue(`${draftField.line_item_id}`, {
                  ...fieldValue,
                  inspection_item_photos: fieldValue.inspection_item_photos.concat(newPhoto),
                });
              };

              if (fieldValue.ratingTypeId === 6) {
                // NumberCard
                const numberInputProps: TextInputProps = {
                  value: fieldValue.number_choice || '',
                  onChangeText: (value) => {
                    setFieldValue(`${draftField.line_item_id}`, {
                      ...fieldValue,
                      number_choice: value,
                    });
                  },
                  onBlur: () => updateDraftFieldsAction(assignmentId, values),
                  label: draftField.name,
                  theme,
                };

                return (
                  <NumberCard
                    key={draftField.line_item_id}
                    rating={rating}
                    name={draftField.name}
                    description={draftField.description}
                    commentInputProps={commentInputProps}
                    numberInputProps={numberInputProps}
                    photos={draftField.inspection_item_photos}
                    onTakePhoto={handleTakePhoto}
                  />
                );
              }

              // TextCard
              return (
                <TextCard
                  key={draftField.line_item_id}
                  name={draftField.name}
                  description={draftField.description}
                  commentInputProps={commentInputProps}
                  photos={draftField.inspection_item_photos}
                  onTakePhoto={handleTakePhoto}
                />
              );
            })}
            <Button
              onPress={handleSubmit}
              mode="contained"
              dark
              style={{ width: 120, alignSelf: 'flex-end', marginTop: 10 }}
            >
              Submit
            </Button>
          </FormContainer>
        )}
      </Formik>
    </ScrollView>
  );
};

export default EditFormScreen;
