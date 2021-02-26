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
import LoadingOverlay from 'src/components/LoadingOverlay';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { INSPECTIONS_FORM, RATING_CHOICES_MODAL, SIGNATURE_MODAL } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import { DraftField, DraftForm, DraftPhoto } from 'src/types';
import usePrevious from 'src/utils/usePrevious';
import { useResult } from 'src/utils/useResult';
import { submitDraftAction, updateDraftFieldsAction, updateDraftFormAction } from 'src/pullstate/actions';
import getCurrentPosition from 'src/utils/getCurrentPosition';

import { createRenderCard } from '../FormCards/createRenderCard';

import OptionRow from './OptionRow';

async function updateSignature(
  assignmentId: number,
  newPhoto: RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM>['params']['newPhoto'],
  formValues: Record<string, DraftField>,
) {
  if (!newPhoto) {
    return;
  }

  let coords: { latitude: number | null; longitude: number | null } = {
    latitude: null,
    longitude: null,
  };

  try {
    const position = await getCurrentPosition();
    coords = position.coords;
  } catch (e) {
    console.warn('signature getCurrentPosition failed with error: ', e);
  }

  const data: DraftPhoto = {
    isFromGallery: false,
    uri: newPhoto.path,
    fileName: newPhoto.fileName,
    latitude: coords.latitude,
    longitude: coords.longitude,
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

function parseFieldsWithCategories(draft: DraftForm) {
  const filteredFields = sortBy(
    'position',
    Object.values(draft.fields).filter((f) => !f.deleted),
  );

  const categoryIds = uniq(map('category_id', filteredFields)).map((c) => c?.toString() || 'null');

  return toPairs(groupBy('category_id', filteredFields))
    .sort((a, b) => categoryIds.indexOf(a[0]) - categoryIds.indexOf(b[0]))
    .flatMap(([catId, values]) => [
      catId === 'undefined' || catId === 'null' ? '' : draft.categories[catId] || 'Category',
      sortBy('position', values),
    ])
    .flat();
}

const EditFormScreen: React.FC<{}> = () => {
  const {
    params: { assignmentId, newPhoto, rangeChoicesSelection },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM>>();
  const formikBagRef = useRef<FormikProps<Record<string, DraftField>> | null>(null);
  const theme = useTheme();
  const navigation = useNavigation();

  const previousPhoto = usePrevious(newPhoto);
  const previousRangeChoicesSelection = usePrevious(rangeChoicesSelection);

  const [expandedPhoto, setExpandedPhoto] = useState<{ photos: string[]; index: number }>({
    photos: [],
    index: -1,
  });
  const userData = PersistentUserStore.useState((s) => s.userData);
  const draft: DraftForm | undefined = PersistentUserStore.useState((s) => s.drafts[assignmentId]);
  const ratings = PersistentUserStore.useState((s) => s.ratings);
  const [isFlagged, setIsFlagged] = useState(draft?.flagged);
  const [isPrivate, setIsPrivate] = useState(draft?.privateInspection || draft?.private);
  const [isReady, onReady] = useResult<undefined>();

  useEffect(() => {
    let mounted = true;

    // This is for when coming back from the signature screen
    (async () => {
      if (formikBagRef.current && newPhoto && newPhoto !== previousPhoto) {
        const newValues = await updateSignature(assignmentId, newPhoto, formikBagRef.current.values);

        if (newValues && mounted) {
          formikBagRef.current.setFieldValue(`${newPhoto.formFieldId}`, newValues[newPhoto.formFieldId]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [assignmentId, newPhoto, previousPhoto]);

  useEffect(() => {
    // This is for when coming back from the rating choices screen
    if (formikBagRef.current && rangeChoicesSelection && rangeChoicesSelection !== previousRangeChoicesSelection) {
      const { formFieldId, listChoiceIds } = rangeChoicesSelection;
      const formValues = formikBagRef.current.values;
      const newValues = set([formFieldId, 'list_choice_ids'], listChoiceIds, formValues);

      formikBagRef.current.setFieldValue(`${formFieldId}`, newValues[formFieldId]);

      updateDraftFieldsAction(assignmentId, newValues);
    }
  }, [assignmentId, rangeChoicesSelection, previousRangeChoicesSelection]);

  if (!userData || !draft) {
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

  const deletedFields = Object.values(draft.fields).filter((f) => f.deleted);

  const hasCoordinates = draft.latitude !== null && draft.longitude !== null;

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
                <Notes value={draft.notes} onReady={onReady} isCard />
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
            ListFooterComponent={
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
                          value={isFlagged}
                          label="Flag and Create Ticket"
                          onToggle={() => {
                            updateDraftFormAction(assignmentId, 'flagged', !isFlagged);
                            setIsFlagged(!isFlagged);
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
                          value={isPrivate}
                          label="Mark as Private"
                          onToggle={() => {
                            updateDraftFormAction(assignmentId, 'private', !isPrivate);
                            setIsPrivate(!isPrivate);
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
            }
            data={parseFieldsWithCategories(draft)}
            keyExtractor={(item) => (isString(item) ? item : `${item.formFieldId}`)}
            renderItem={createRenderCard(formikProps, {
              setExpandedPhoto,
              assignmentId,
              ratings,
              theme,
              goToSignature,
              goToRatingChoices,
              isReadonly: false,
            })}
          />
        )}
      </Formik>
      {!isReady && <LoadingOverlay />}
    </View>
  );
};

export default EditFormScreen;
