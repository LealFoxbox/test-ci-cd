import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Button, Card, Chip, Divider, useTheme } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Formik, FormikProps } from 'formik';
import { groupBy, isString, map, set, sortBy, toPairs, uniq } from 'lodash/fp';
import RNFS from 'react-native-fs';

import ExpandedGallery from 'src/components/ExpandedGallery';
import Notes from 'src/components/Notes';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { INSPECTIONS_FORM, RATING_CHOICES_MODAL, SIGNATURE_MODAL } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import { DraftField, DraftPhoto } from 'src/types';
import usePrevious from 'src/utils/usePrevious';
import { submitDraftAction, updateDraftFieldsAction } from 'src/pullstate/actions';

import { createRenderCard } from '../FormCards/createRenderCard';

import OptionRow from './OptionRow';

function updateSignature(
  assignmentId: number,
  newPhoto: RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM>['params']['newPhoto'],
  formValues: Record<string, DraftField>,
) {
  if (!newPhoto) {
    return;
  }

  const data: DraftPhoto = {
    isFromGallery: false,
    uri: newPhoto.path,
    fileName: newPhoto.fileName,
    latitude: null, // TODO:
    longitude: null, // TODO:
    created_at: Date.now(),
  };

  const oldPhotos = formValues[newPhoto.formFieldId]?.photos || [];

  oldPhotos.forEach(({ uri }) => {
    try {
      void RNFS.unlink(uri);
    } catch (e) {
      console.warn('Error deleting old signature: ', e);
    }
  });

  const newValues = set([newPhoto.formFieldId, 'photos'], [data], formValues);

  updateDraftFieldsAction(assignmentId, newValues);

  return newValues;
}

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
      const newValues = updateSignature(assignmentId, newPhoto, formikBagRef.current.values);

      if (newValues) {
        formikBagRef.current.setFieldValue(`${newPhoto.formFieldId}`, newValues[newPhoto.formFieldId]);
      }
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
      const { formFieldId, listChoiceIds } = rangeChoicesSelection;
      const formValues = formikBagRef.current.values;
      const newValues = set([formFieldId, 'list_choice_ids'], listChoiceIds, formValues);

      formikBagRef.current.setFieldValue(`${formFieldId}`, newValues[formFieldId]);

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

  const hasCoordinates = draft.latitude && draft.longitude;

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
                {false && deletedFields.length > 0 && (
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
              <>
                <Card style={{ margin: 10 }}>
                  <Card.Title title="Options" />
                  <Card.Content>
                    {!!userData?.features.ticket_feature.enabled && (
                      <>
                        <OptionRow
                          icon={
                            <Ionicons
                              name="ios-flag"
                              size={16}
                              color={theme.colors.surface}
                              style={{ backgroundColor: theme.colors.primary, borderRadius: 8, padding: 5 }}
                            />
                          }
                          value={draft.flagged}
                          label="Flag and Create Ticket"
                          onToggle={() => {
                            // change draft.flagged
                            // TODO:
                          }}
                        />

                        <Divider />
                      </>
                    )}
                    {!!userData?.features.inspection_feature.private_inspections_enabled && (
                      <>
                        <OptionRow
                          icon={
                            <Ionicons
                              name="ios-lock-closed"
                              size={16}
                              color={theme.colors.surface}
                              style={{ backgroundColor: theme.colors.placeholder, borderRadius: 8, padding: 5 }}
                            />
                          }
                          disabled={draft.privateInspection}
                          value={draft.privateInspection || draft.private}
                          label="Mark as Private"
                          onToggle={() => {
                            // change draft.private
                            // TODO:
                          }}
                        />
                        <Divider />
                      </>
                    )}
                    <OptionRow
                      icon={
                        <MaterialCommunityIcons
                          name={hasCoordinates ? 'map-marker' : 'map-marker-off'}
                          size={16}
                          color={theme.colors.surface}
                          style={{
                            backgroundColor: hasCoordinates ? theme.colors.gps : theme.colors.error,
                            borderRadius: 8,
                            padding: 5,
                          }}
                        />
                      }
                      label={hasCoordinates ? 'Location Found' : 'Location Not Found'}
                    />
                  </Card.Content>
                </Card>
                <Button
                  onPress={formikProps.handleSubmit}
                  mode="contained"
                  dark
                  style={{ width: 120, alignSelf: 'flex-end', marginTop: 10, marginBottom: 20, marginHorizontal: 10 }}
                >
                  Submit
                </Button>
              </>
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
