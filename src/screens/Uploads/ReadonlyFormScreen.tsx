import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Card, Divider, useTheme } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { groupBy, isString, map, sortBy, toPairs, uniq } from 'lodash/fp';

import ExpandedGallery from 'src/components/ExpandedGallery';
import Notes from 'src/components/Notes';
import LoadingOverlay from 'src/components/LoadingOverlay';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { LoginStore } from 'src/pullstate/loginStore';
import { RATING_CHOICES_MODAL, SIGNATURE_MODAL, UPLOADS_READONLY_FORM } from 'src/navigation/screenNames';
import { RatingChoicesModalParams, SignatureModalParams } from 'src/navigation/MainStackNavigator';
import { UploadsNavigatorParamList } from 'src/navigation/UploadsNavigator';
import { DraftForm } from 'src/types';
import { useResult } from 'src/utils/useResult';
import { getFormFieldId } from 'src/pullstate/formActions';

import { createRenderCard } from '../Inspections/FormCards/createRenderCard';
import OptionRow from '../Inspections/FormScreen/OptionRow';

function parseFieldsWithCategories(draft: DraftForm) {
  const filteredFields = sortBy(
    'position',
    Object.values(draft.fields || {}).filter((f) => !f.deleted),
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

const noop = () => {};

const fakeFormikProps = {
  setFieldValue: (_f: string, _value: any) => {},
  errors: {},
  touched: {},
  isValidating: false,
  submitCount: 1,
  isSubmitting: false,
  setStatus: noop,
  setSubmitting: noop,
  setErrors: noop,
  setTouched: noop,
  setValues: noop,
  setFieldError: noop,
  setFieldTouched: noop,
  // eslint-disable-next-line @typescript-eslint/require-await
  validateForm: async (_v?: any) => ({}),
  validateField: noop,
  resetForm: noop,
  submitForm: async () => {},
  setFormikState: noop,
  handleSubmit: noop,
  handleBlur: noop,
  handleChange: noop,
  handleReset: noop,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  getFieldHelpers: () => ({} as any),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  getFieldMeta: (_n: string) => ({} as any),
  getFieldProps: () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    value: '' as any,
    name: '',
    onChange: noop,
    onBlur: noop,
  }),

  dirty: false,
  isValid: true,
  initialErrors: {},
  initialTouched: {},
  registerField: noop,
  unregisterField: noop,
};

const ReadonlyFormScreen: React.FC<{}> = () => {
  const {
    params: { guid },
  } = useRoute<RouteProp<UploadsNavigatorParamList, typeof UPLOADS_READONLY_FORM>>();
  const theme = useTheme();
  const navigation = useNavigation();

  const [expandedPhoto, setExpandedPhoto] = useState<{ photos: string[]; index: number }>({
    photos: [],
    index: -1,
  });
  const userData = LoginStore.useState((s) => s.userData);
  const { draft, ratings } = PersistentUserStore.useState((s) => ({
    ratings: s.ratings,
    draft:
      s.pendingUploads.find((u) => u.draft.guid === guid)?.draft || s.uploads.find((u) => u.draft.guid === guid)?.draft,
  }));
  const [isFlagged] = useState(draft?.flagged);
  const [isPrivate] = useState(draft?.privateInspection || draft?.private);
  const [isReady, onReady] = useResult<undefined>();

  if (!userData || !draft) {
    return <View />;
  }

  const goToSignature = (formFieldId: number) => {
    const p: SignatureModalParams = { assignmentId: draft.assignmentId, formFieldId, title: 'Signature' };
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
    const p: RatingChoicesModalParams = { assignmentId: draft.assignmentId, ratingId, formFieldId, title };
    navigation.navigate(RATING_CHOICES_MODAL, p);
  };

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

      <FlatList
        contentContainerStyle={{
          justifyContent: 'flex-start',
        }}
        ListHeaderComponent={<Notes value={draft.notes} onReady={onReady} isCard />}
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
                      disabled
                      value={isFlagged}
                      label="Flag and Create Ticket"
                      onToggle={() => {}}
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
                      disabled
                      value={isPrivate}
                      label="Mark as Private"
                      onToggle={() => {}}
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
          </>
        }
        data={parseFieldsWithCategories(draft)}
        keyExtractor={(item) => (isString(item) ? item : `${getFormFieldId(item)}`)}
        renderItem={createRenderCard(
          {
            values: draft.fields,
            initialValues: draft.fields,
            ...fakeFormikProps,
          },
          {
            setExpandedPhoto,
            assignmentId: draft.assignmentId,
            ratings,
            theme,
            goToSignature,
            goToRatingChoices,
            isReadonly: true,
          },
        )}
      />
      {!isReady && <LoadingOverlay />}
    </View>
  );
};

export default ReadonlyFormScreen;
