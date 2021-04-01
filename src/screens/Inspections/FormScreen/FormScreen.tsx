import React, { useEffect, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ActivityIndicator, Button, Card, Chip, Divider, useTheme } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Formik, FormikProps } from 'formik';
import { groupBy, isString, map, set, sortBy, toPairs, uniq } from 'lodash/fp';
import RNFS from 'react-native-fs';

import ExpandedGallery from 'src/components/ExpandedGallery';
import Notes from 'src/components/Notes';
import LoadingOverlay from 'src/components/LoadingOverlay';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { LoginStore } from 'src/pullstate/loginStore';
import { RATING_CHOICES_MODAL, SIGNATURE_MODAL } from 'src/navigation/screenNames';
import { InspectionFormParams, InspectionFormRoute } from 'src/navigation/InspectionsNavigator';
import { RatingChoicesModalParams, SignatureModalParams } from 'src/navigation/MainStackNavigator';
import { DraftField, DraftForm, DraftPhoto } from 'src/types';
import usePrevious from 'src/utils/usePrevious';
import { useResult } from 'src/utils/useResult';
import {
  submitDraftAction,
  updateDraftCoords,
  updateDraftFieldsAction,
  updateDraftFormAction,
} from 'src/pullstate/formActions';
import getCurrentPosition from 'src/utils/getCurrentPosition';

import { createRenderCard } from '../FormCards/createRenderCard';

import OptionRow from './OptionRow';

async function updateSignature(
  assignmentId: number,
  newPhoto: InspectionFormParams['newPhoto'],
  formValues: Record<string, DraftField>,
) {
  if (!newPhoto) {
    return;
  }

  const coords = await getCurrentPosition();

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

  if (!draft.categories) {
    console.warn('[APP] FormScreen - DRAFT CATEGORIES => UNDEFINED');
  }

  return toPairs(groupBy('category_id', filteredFields))
    .sort((a, b) => categoryIds.indexOf(a[0]) - categoryIds.indexOf(b[0]))
    .flatMap(([catId, values]) => [
      catId === 'undefined' || catId === 'null' ? '' : draft.categories?.[catId] || 'Category',
      sortBy('position', values),
    ])
    .flat();
}

const EditFormScreen: React.FC<{}> = () => {
  const {
    params: { assignmentId, newPhoto, rangeChoicesSelection },
  } = useRoute<InspectionFormRoute>();
  const userData = LoginStore.useState((s) => s.userData);
  const { draft, ratings } = PersistentUserStore.useState((s) => ({
    ratings: s.ratings,
    draft: s.drafts[assignmentId] as DraftForm | undefined,
  }));

  const formikBagRef = useRef<FormikProps<Record<string, DraftField>> | null>(null);
  const theme = useTheme();
  const navigation = useNavigation();
  const previousPhoto = usePrevious(newPhoto);
  const previousRangeChoicesSelection = usePrevious(rangeChoicesSelection);

  const [expandedPhoto, setExpandedPhoto] = useState<{ photos: string[]; index: number }>({
    photos: [],
    index: -1,
  });

  const [isFlagged, setIsFlagged] = useState(draft?.flagged);
  const [isPrivate, setIsPrivate] = useState(draft?.privateInspection || draft?.private);
  const [isGpsLoading, setGpsLoading] = useState(false);
  const [isReady, onReady] = useResult<undefined>();

  const hasCoordinates = !!draft && draft.latitude !== null && draft.longitude !== null;

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!hasCoordinates && draft) {
        setGpsLoading(true);
        const coords = await getCurrentPosition();

        updateDraftCoords(draft.assignmentId, coords);

        if (mounted) {
          setGpsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [draft, draft?.assignmentId, hasCoordinates]);

  if (!userData || !draft) {
    return <View />;
  }

  const submit = () => {
    submitDraftAction(assignmentId);
    navigation.goBack();
  };

  const goToSignature = (formFieldId: number) => {
    const p: SignatureModalParams = { assignmentId, formFieldId, title: 'Signature' };
    navigation.navigate(SIGNATURE_MODAL, p);
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
    const p: RatingChoicesModalParams = { assignmentId, ratingId, formFieldId, title };
    navigation.navigate(RATING_CHOICES_MODAL, p);
  };

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
                        isGpsLoading ? (
                          <ActivityIndicator size="small" />
                        ) : (
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
                        )
                      }
                      label={
                        isGpsLoading ? 'Loading Location ...' : hasCoordinates ? 'Location Found' : 'Location Not Found'
                      }
                    />
                  </Card.Content>
                </Card>
                <Button
                  onPress={formikProps.handleSubmit}
                  mode="contained"
                  color={theme.colors.success}
                  dark
                  style={{ marginTop: 10, marginBottom: 20, marginHorizontal: 10 }}
                  icon="arrow-up-circle"
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
