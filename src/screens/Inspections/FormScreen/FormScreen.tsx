import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Button, Card, Chip, useTheme } from 'react-native-paper';
import { Formik, FormikProps } from 'formik';
import { groupBy, isString, map, set, sortBy, toPairs, uniq } from 'lodash/fp';
import RNFS from 'react-native-fs';

import ExpandedGallery from 'src/components/ExpandedGallery';
import Notes from 'src/components/Notes';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { INSPECTIONS_FORM, RATING_CHOICES_MODAL, SIGNATURE_MODAL } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import { DraftField, DraftPhoto, SelectField } from 'src/types';
import usePrevious from 'src/utils/usePrevious';
import { submitDraftAction, updateDraftFieldsAction } from 'src/pullstate/actions';

import { createRenderCard } from '../FormCards/createRenderCard';

const EditFormScreen: React.FC<{}> = () => {
  const {
    params: { formId, structureId, assignmentId, newPhoto, rangeChoicesSelection },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM>>();
  const formikBagRef = useRef<FormikProps<Record<string, DraftField>> | null>(null);

  const previousPhoto = usePrevious(newPhoto);
  const previousRangeChoicesSelection = usePrevious(rangeChoicesSelection);

  const [expandedPhoto, setExpandedPhoto] = useState<{ photos: string[]; index: number }>({
    photos: [],
    index: -1,
  });
  const userData = PersistentUserStore.useState((s) => s.userData);
  const draft = PersistentUserStore.useState((s) => (assignmentId ? s.drafts[assignmentId] : undefined));
  const ratings = PersistentUserStore.useState((s) => s.ratings);
  const theme = useTheme();

  const navigation = useNavigation();

  useEffect(() => {
    // This is for when coming back from the signature screen
    if (formikBagRef.current && assignmentId !== null && newPhoto && newPhoto !== previousPhoto) {
      const data: DraftPhoto = {
        isFromGallery: false,
        uri: newPhoto.path,
        fileName: newPhoto.fileName,
        latitude: null, // TODO:
        longitude: null, // TODO:
        created_at: Date.now(),
      };

      const oldPhotos = formikBagRef.current.values[newPhoto.formFieldId]?.photos || [];

      oldPhotos.forEach(({ uri }) => {
        try {
          void RNFS.unlink(uri);
        } catch (e) {
          console.warn('Error deleting old signature: ', e);
        }
      });

      const newValues = set(`${newPhoto.formFieldId}.photos`, [data], formikBagRef.current.values);

      formikBagRef.current.setFieldValue(`${newPhoto.formFieldId}`, newValues[newPhoto.formFieldId]);

      updateDraftFieldsAction(assignmentId, newValues);
    }
  }, [assignmentId, newPhoto, previousPhoto]);

  useEffect(() => {
    // This is for when coming back from the rating choices screen
    if (
      formikBagRef.current &&
      assignmentId !== null &&
      rangeChoicesSelection &&
      rangeChoicesSelection !== previousRangeChoicesSelection
    ) {
      const field = formikBagRef.current.values[rangeChoicesSelection.formFieldId] as SelectField;
      field.list_choice_ids;

      const newValues = set(
        `${rangeChoicesSelection.formFieldId}.list_choice_ids`,
        rangeChoicesSelection.listChoiceIds,
        formikBagRef.current.values,
      );

      formikBagRef.current.setFieldValue(
        `${rangeChoicesSelection.formFieldId}`,
        newValues[rangeChoicesSelection.formFieldId],
      );

      updateDraftFieldsAction(assignmentId, newValues);
    }
  }, [assignmentId, rangeChoicesSelection, previousRangeChoicesSelection]);

  if (!userData || !formId || !structureId || !assignmentId || !draft) {
    return <View />;
  }

  const submit = () => {
    submitDraftAction(assignmentId);
    navigation.goBack();
  };

  const goToSignature = (formFieldId: number) => {
    navigation.navigate(SIGNATURE_MODAL, { assignmentId, formFieldId });
  };

  const goToRatingChoices = ({
    title,
    ratingId,
    formFieldId,
  }: {
    title: string;
    ratingId: number;
    formFieldId: number;
  }) => {
    navigation.navigate(RATING_CHOICES_MODAL, { assignmentId, ratingId, formFieldId, title });
  };

  const filteredFields = sortBy(
    'position',
    Object.values(draft.fields).filter((f) => !f.deleted),
  );

  const categoryIds = uniq(map('category_id', filteredFields)).map((c) => c?.toString() || 'null');

  const fields = toPairs(groupBy('category_id', filteredFields))
    .sort((a, b) => categoryIds.indexOf(a[0]) - categoryIds.indexOf(b[0]))
    .flatMap(([catId, values]) => [
      catId === 'undefined' || catId === 'null' ? '' : draft.categories[catId] || 'Category',
      sortBy('position', values),
    ])
    .flat();

  const deletedFields = Object.values(draft.fields).filter((f) => f.deleted);

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1, justifyContent: 'center' }}>
      <ExpandedGallery
        images={expandedPhoto.photos.map((uri) => ({
          uri: `file://${uri}`,
        }))}
        imageIndex={expandedPhoto.index !== -1 ? expandedPhoto.index : 0}
        visible={expandedPhoto.index !== -1}
        onRequestClose={() => setExpandedPhoto((s) => ({ ...s, index: -1 }))}
      />

      <Formik initialValues={draft.fields} onSubmit={submit} innerRef={formikBagRef}>
        {(formikProps) => (
          <FlatList
            contentContainerStyle={{
              justifyContent: 'flex-start',
            }}
            ListHeaderComponent={
              <>
                <Notes value={draft.notes} isCard />
                {deletedFields.length > 0 && (
                  <Card style={{ margin: 10 }}>
                    <Card.Title title="Not Applicable fields" />
                    <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {deletedFields.map((f) => (
                        <Chip key={f.name} style={{ marginRight: 5, marginBottom: 5 }}>
                          {f.name}
                        </Chip>
                      ))}
                    </Card.Content>
                  </Card>
                )}
              </>
            }
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
            data={fields}
            keyExtractor={(item) => (isString(item) ? item : `${item.formFieldId}`)}
            renderItem={createRenderCard(formikProps, {
              setExpandedPhoto,
              assignmentId,
              ratings,
              theme,
              goToSignature,
              goToRatingChoices,
            })}
          />
        )}
      </Formik>
    </View>
  );
};

export default EditFormScreen;