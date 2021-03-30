import React from 'react';
import { FlatList, View } from 'react-native';
import { Button, Divider, ProgressBar, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { orderBy } from 'lodash/fp';
import { format } from 'date-fns';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { LoginStore } from 'src/pullstate/loginStore';
import { UploadStore } from 'src/pullstate/uploadStore';
import { getUploadState } from 'src/pullstate/uploadStore/selectors';
import { cleanUploadErrorsAction } from 'src/pullstate/uploaderActions';
import { UPLOADS_READONLY_FORM } from 'src/navigation/screenNames';
import { UploadsReadonlyFormParams } from 'src/navigation/UploadsNavigator';
import ConnectionBanner from 'src/components/ConnectionBanner';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import config, { getMockFlags } from 'src/config';

import UploadRow from './UploadRow';
import BlankScreen from './BlankScreen';

const UploadsScreen: React.FC<{}> = () => {
  const uploads = PersistentUserStore.useState((s) =>
    s.pendingUploads.concat(orderBy('submittedAt', 'desc', s.uploads)),
  );
  const uploadStates = UploadStore.useState((s) => s);
  const isStaging = LoginStore.useState((s) => s.isStaging);
  const connected = useNetworkStatus();
  const theme = useTheme();
  const navigation = useNavigation();

  useFocusEffect(cleanUploadErrorsAction);

  const deleteButtons =
    !config.isDev || !getMockFlags(isStaging).DELETE_BUTTONS ? null : (
      <View style={{ flexDirection: 'row' }}>
        <Button
          onPress={() =>
            PersistentUserStore.update((s) => {
              s.pendingUploads = [];
            })
          }
          mode="contained"
          dark
          style={{ margin: 10, flex: 1 }}
        >
          Delete pending
        </Button>
        <Button
          onPress={() =>
            PersistentUserStore.update((s) => {
              s.uploads = [];
            })
          }
          mode="contained"
          dark
          style={{ margin: 10, flex: 1 }}
        >
          Delete finished
        </Button>
      </View>
    );

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <ConnectionBanner connected={connected} />
      {uploads.length === 0 && <BlankScreen />}
      {uploads.length > 0 && (
        <FlatList
          contentContainerStyle={{
            justifyContent: 'flex-start',
          }}
          ListHeaderComponent={deleteButtons}
          data={uploads}
          extraData={uploadStates}
          ItemSeparatorComponent={Divider}
          renderItem={({ item }) => {
            const { guid } = item.draft;

            const gotoForm = () => {
              const p: UploadsReadonlyFormParams = {
                guid: item.draft.guid,
                title: item.draft.name,
              };
              navigation.navigate(UPLOADS_READONLY_FORM, p);
            };

            if (!item.submittedAt) {
              const { state, progress, error } = getUploadState(uploadStates, guid);

              if (!error && state !== null) {
                return (
                  <UploadRow
                    head="uploading..."
                    title={item.draft.name}
                    content={<ProgressBar progress={progress / 100} color={theme.colors.primary} />}
                    icon="file-document-outline"
                    IconComponent={MaterialCommunityIcons}
                    onPress={gotoForm}
                  />
                );
              } else {
                return (
                  <UploadRow
                    head="waiting to upload"
                    title={item.draft.name}
                    content={item.draft.locationPath}
                    icon="file-document-outline"
                    IconComponent={MaterialCommunityIcons}
                    onPress={gotoForm}
                  />
                );
              }
            } else {
              return (
                <UploadRow
                  head={`uploaded ${format(item.submittedAt, `MMM dd, yyyy 'at' p`)}`}
                  title={item.draft.name}
                  content={item.draft.locationPath}
                  icon="file-document-outline"
                  IconComponent={MaterialCommunityIcons}
                  onPress={gotoForm}
                />
              );
            }
          }}
          keyExtractor={(item) => `${item.draft.guid}`}
        />
      )}
    </View>
  );
};

export default UploadsScreen;
