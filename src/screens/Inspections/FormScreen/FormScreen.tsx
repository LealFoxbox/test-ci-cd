import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BackHandler, FlatList, View } from 'react-native';
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
import { CAMERA_MODAL, RATING_CHOICES_MODAL, SIGNATURE_MODAL } from 'src/navigation/screenNames';
import { InspectionFormParams, InspectionFormRoute } from 'src/navigation/InspectionsNavigator';
import { CameraModalParams, RatingChoicesModalParams, SignatureModalParams } from 'src/navigation/MainStackNavigator';
import { DraftField, DraftForm, DraftPhoto } from 'src/types';
import usePrevious from 'src/utils/usePrevious';
import { useResult } from 'src/utils/useResult';
import {
  deleteDraftAction,
  getFormFieldId,
  submitDraftAction,
  updateDraftCoords,
  updateDraftFieldsAction,
  updateDraftFormAction,
} from 'src/pullstate/formActions';
import getCurrentPosition from 'src/utils/getCurrentPosition';
import { fileUrlCopy } from 'src/screens/Inspections/FormCards/MoreButton';

import { createRenderCard } from '../FormCards/createRenderCard';

import { validateFormScreen } from './validation';
import OptionRow from './OptionRow';

async function updateSignature(
  assignmentId: number,
  newSignature: InspectionFormParams['newSignature'],
  formValues: Record<string, DraftField>,
) {
  if (!newSignature) {
    return;
  }

  const coords = await getCurrentPosition();

  const data: DraftPhoto = {
    isFromGallery: false,
    uri: newSignature.path,
    fileName: newSignature.fileName,
    latitude: coords.latitude,
    longitude: coords.longitude,
    created_at: Date.now(),
  };

  const oldPhotos = formValues[newSignature.formFieldId]?.photos || [];

  oldPhotos.forEach(({ uri }) => {
    try {
      void RNFS.unlink(uri);
    } catch (e) {
      console.warn('Error deleting old signature: ', e);
    }
  });

  const newValues = set([newSignature.formFieldId, 'photos'], [data], formValues);

  updateDraftFieldsAction(assignmentId, newValues);

  return newValues;
}

async function updatePhoto(
  assignmentId: number,
  newPhoto: InspectionFormParams['newPhoto'],
  formValues: Record<string, DraftField>,
) {
  if (!newPhoto) {
    return;
  }

  const newUri = await fileUrlCopy(newPhoto.path, newPhoto.fileName);

  const coords = await getCurrentPosition();

  const photo: DraftPhoto = {
    isFromGallery: false,
    uri: newUri,
    fileName: newPhoto.fileName,
    latitude: coords.latitude,
    longitude: coords.longitude,
    created_at: Date.now(),
  };

  const fieldValue = formValues[newPhoto.formFieldId];

  const newValues = set([newPhoto.formFieldId, 'photos'], fieldValue.photos.concat([photo]), formValues);

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
      catId === 'undefined' || catId === 'null' ? '' : draft.categories?.[catId] || 'Category',
      sortBy('position', values),
    ])
    .flat();
}

const EditFormScreen: React.FC<{}> = () => {
  const {
    params: { assignmentId, newSignature, rangeChoicesSelection, newPhoto },
    name: screenName,
  } = useRoute<InspectionFormRoute>();

  const userData = LoginStore.useState((s) => s.userData);
  const { draft, ratings } = PersistentUserStore.useState((s) => ({
    ratings: s.ratings,
    draft: s.drafts[assignmentId] as DraftForm | undefined,
  }));

  const formikBagRef = useRef<FormikProps<Record<string, DraftField>> | null>(null);
  const theme = useTheme();
  const navigation = useNavigation();
  const previousSignature = usePrevious(newSignature);
  const previousPhoto = usePrevious(newPhoto);
  const previousRangeChoicesSelection = usePrevious(rangeChoicesSelection);
  const componentNavigationMounted = useRef<boolean>(true);
  const componentMounted = useRef<boolean>(true);

  const [expandedPhoto, setExpandedPhoto] = useState<{ photos: string[]; index: number }>({
    photos: [],
    index: -1,
  });

  const [isFlagged, setIsFlagged] = useState(draft?.flagged);
  const [isPrivate, setIsPrivate] = useState(draft?.privateInspection || draft?.private);
  const [isGpsLoading, setGpsLoading] = useState(false);
  const [isReady, onReady] = useResult<undefined>();

  const hasCoordinates = !!draft && draft.latitude !== null && draft.longitude !== null;

  useLayoutEffect(() => {
    // we set goBackCallback to call in header component and remove draft without changes
    if (componentNavigationMounted.current) {
      navigation.setParams({
        goBackCallback: () => {
          if (draft?.isDirty === false) {
            componentNavigationMounted.current = false;
            deleteDraftAction(draft?.assignmentId);
          }
        },
      });
    }

    return () => {};
  }, [navigation, draft]);

  const handleBackPress = useCallback(() => {
    // we return false to signal that we haven't handled the event (so that RN takes care of it)
    if (draft?.isDirty === false) {
      deleteDraftAction(draft?.assignmentId);
    }
    return false;
  }, [draft]);

  useEffect(() => {
    const hardwareBackPressListener = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => hardwareBackPressListener.remove();
  }, [handleBackPress]);

  useEffect(() => {
    // This is for when coming back from the signature screen
    componentMounted.current = true;

    (async () => {
      if (formikBagRef.current && newSignature && newSignature !== previousSignature) {
        const newValues = await updateSignature(assignmentId, newSignature, formikBagRef.current.values);

        if (newValues && componentMounted.current) {
          formikBagRef.current.setFieldValue(`${newSignature.formFieldId}`, newValues[newSignature.formFieldId]);
        }
      }
    })();

    return () => {
      componentMounted.current = false;
    };
  }, [assignmentId, newSignature, previousSignature]);

  useEffect(() => {
    // This is for when coming back from the camera screen
    componentMounted.current = true;

    (async () => {
      if (formikBagRef.current && newPhoto && newPhoto !== previousPhoto) {
        const newValues = await updatePhoto(assignmentId, newPhoto, formikBagRef.current.values);

        if (newValues && componentMounted.current) {
          formikBagRef.current.setFieldValue(`${newPhoto.formFieldId}`, newValues[newPhoto.formFieldId]);
        }
      }
    })();

    return () => {
      componentMounted.current = false;
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
    componentMounted.current = true;
    (async () => {
      if (!hasCoordinates && draft) {
        setGpsLoading(true);
        const coords = await getCurrentPosition();

        updateDraftCoords(draft.assignmentId, coords);

        if (componentMounted.current) {
          setGpsLoading(false);
        }
      }
    })();

    return () => {
      componentMounted.current = false;
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
    const p: SignatureModalParams = {
      assignmentId,
      formFieldId,
      title: 'Signature',
      screenName,
    };
    navigation.navigate(SIGNATURE_MODAL, p);
  };

  const goToCamera = (formFieldId: number, callback: () => void) => {
    const p: CameraModalParams = {
      formFieldId,
      screenName,
      callback,
    };
    navigation.navigate(CAMERA_MODAL, p);
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
    const p: RatingChoicesModalParams = {
      assignmentId,
      ratingId,
      formFieldId,
      title,
      screenName,
    };
    navigation.navigate(RATING_CHOICES_MODAL, p);
  };

  const deletedFields = Object.values(draft.fields || {}).filter((f) => f.deleted);

  const draftData = parseFieldsWithCategories(draft);

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
                  disabled={!validateFormScreen(formikProps.values)}
                >
                  Submit
                </Button>
              </>
            }
            data={draftData}
            keyExtractor={(item) => (isString(item) ? item : `${getFormFieldId(item)}`)}
            renderItem={createRenderCard(formikProps, {
              setExpandedPhoto,
              assignmentId,
              ratings,
              theme,
              goToSignature,
              goToRatingChoices,
              goToCamera,
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
