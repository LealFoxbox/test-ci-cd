import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Button, Text, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import { sortBy } from 'lodash/fp';

import ExpandedGallery from 'src/components/ExpandedGallery';
import Notes from 'src/components/Notes';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { INSPECTIONS_FORM, SIGNATURE_MODAL } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';

import { createRenderCard } from './createRenderCard';

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

  const submit = () => {
    PersistentUserStore.update((s) => {
      s.pendingUploads.push(s.drafts[assignmentId]);
      delete s.drafts[assignmentId];
    });
    navigation.goBack();
  };

  const goToSignature = (formFieldId: number) => {
    navigation.navigate(SIGNATURE_MODAL, { assignmentId, formFieldId });
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
      <Formik initialValues={draft.fields} onSubmit={submit}>
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
            data={sortBy('position', Object.values(draft.fields))}
            keyExtractor={(item) => `${item.formFieldId}`}
            renderItem={createRenderCard(formikProps, {
              setExpandedPhoto,
              assignmentId,
              ratings,
              theme,
              goToSignature,
            })}
          />
        )}
      </Formik>
    </View>
  );
};

export default EditFormScreen;
