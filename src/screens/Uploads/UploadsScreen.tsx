import React from 'react';
import { FlatList, View } from 'react-native';
import { Button, Divider, ProgressBar, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { sortBy } from 'lodash/fp';
import { format } from 'date-fns';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import ConnectionBanner from 'src/components/ConnectionBanner';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import config from 'src/config';
import { UploadStore } from 'src/pullstate/uploadStore';
import { getUploadState } from 'src/pullstate/uploadStore/selectors';

import UploadRow from './UploadRow';
import BlankScreen from './BlankScreen';

const UploadsScreen: React.FC<{}> = () => {
  const uploads = PersistentUserStore.useState((s) => s.pendingUploads.concat(sortBy('submittedAt', s.uploads)));
  const uploadStates = UploadStore.useState((s) => s);
  const connected = useNetworkStatus();
  const theme = useTheme();

  const deleteButtons =
    !config.MOCKS.DELETE_BUTTONS || !config.isDev ? null : (
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

            if (!item.submittedAt) {
              const { state, progress, error } = getUploadState(uploadStates, guid);

              if (state !== null || progress > 0) {
                return (
                  <UploadRow
                    head="uploading..."
                    title={item.draft.name}
                    content={<ProgressBar progress={progress / 100} color={theme.colors.primary} />}
                    icon="file-document-outline"
                    IconComponent={MaterialCommunityIcons}
                    error={error}
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
                    error={error}
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
