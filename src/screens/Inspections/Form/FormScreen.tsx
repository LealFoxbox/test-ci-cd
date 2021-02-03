import React from 'react';
import { FlatList, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Button, Title, useTheme } from 'react-native-paper';
import { TextInputProps } from 'react-native-paper/lib/typescript/src/components/TextInput/TextInput';
import { Formik } from 'formik';
import { fromPairs, memoize } from 'lodash/fp';

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
    <View style={{ backgroundColor: theme.colors.background }}>
      <Formik initialValues={initialValues} onSubmit={submit}>
        {({ values, setFieldValue, handleSubmit }) => (
          <FormContainer>
            <FlatList
              contentContainerStyle={{
                justifyContent: 'flex-start',
              }}
              ListHeaderComponent={() => (draft.notes ? <Title>{draft.notes}</Title> : null)}
              data={draft.fields}
              keyExtractor={(item) => `${item.line_item_id}`}
              renderItem={({ item: draftField }) => {
                const fieldValue = values[draftField.line_item_id];
                const rating = ratings[fieldValue.ratingTypeId];

                const handleBlur = () => updateDraftFieldsAction(assignmentId, values);
                const handleTakePhoto = (uri: string, isFromGallery: boolean) => {
                  const newPhoto: DraftPhoto = {
                    isFromGallery,
                    uri,
                    latitude: null, // Latitude where the inspection was started or first available location coordinates
                    longitude: null, // Longitude where the inspection was started or first available location coordinates
                    created_at: Date.now(), // timestamp in format "2020-01-08T14:52:56-07:00",
                  };

                  setFieldValue(`${fieldValue.line_item_id}`, {
                    ...fieldValue,
                    inspection_item_photos: fieldValue.inspection_item_photos.concat([newPhoto]),
                  });
                };

                const commentInputProps: TextInputProps = {
                  value: fieldValue.comment || '',
                  onChangeText: (value) => {
                    setFieldValue(`${fieldValue.line_item_id}`, { ...fieldValue, comment: value });
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
                      setFieldValue(`${fieldValue.line_item_id}`, {
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
                      key={fieldValue.line_item_id}
                      rating={rating}
                      name={fieldValue.name}
                      description={fieldValue.description}
                      commentInputProps={commentInputProps}
                      numberInputProps={numberInputProps}
                      photos={fieldValue.inspection_item_photos}
                      onTakePhoto={handleTakePhoto}
                    />
                  );
                }

                // TextCard
                return (
                  <TextCard
                    key={fieldValue.line_item_id}
                    name={fieldValue.name}
                    description={fieldValue.description}
                    commentInputProps={commentInputProps}
                    photos={fieldValue.inspection_item_photos}
                    onTakePhoto={handleTakePhoto}
                  />
                );
              }}
            />
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
    </View>
  );
};

export default EditFormScreen;
