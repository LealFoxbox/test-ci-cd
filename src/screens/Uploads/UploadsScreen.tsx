import React from 'react';
import { FlatList, View } from 'react-native';
import { Button, Divider, ProgressBar, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { sortBy } from 'lodash/fp';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import Row from 'src/components/Row';
import ConnectionBanner from 'src/components/ConnectionBanner';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';
import config from 'src/config';
import { UploadStore } from 'src/pullstate/uploadStore';

import BlankScreen from './BlankScreen';

const UploadsScreen: React.FC<{}> = () => {
  const uploads = PersistentUserStore.useState((s) => s.pendingUploads.concat(sortBy('submittedAt', s.uploads)));
  const uploadStates = UploadStore.useState((s) => s);
  const connected = useNetworkStatus();
  const theme = useTheme();

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
          ListHeaderComponent={
            !config.isStaging ? null : (
              <View>
                <Button
                  onPress={() =>
                    PersistentUserStore.update((s) => {
                      s.pendingUploads = [];
                    })
                  }
                >
                  Delete pending uploads
                </Button>
                <Button
                  onPress={() =>
                    PersistentUserStore.update((s) => {
                      s.uploads = [];
                    })
                  }
                >
                  Delete finished uploads
                </Button>
              </View>
            )
          }
          data={uploads}
          extraData={uploadStates}
          ItemSeparatorComponent={Divider}
          renderItem={({ item }) => {
            const { guid } = item.draft;

            if (!item.submittedAt) {
              return (
                <Row
                  label={item.draft.name}
                  value={
                    <ProgressBar progress={(uploadStates[guid]?.progress || 0) / 100} color={theme.colors.primary} />
                  }
                  icon="file-document-outline"
                  IconComponent={MaterialCommunityIcons}
                />
              );
            } else {
              return (
                <Row
                  label={item.draft.name}
                  value={`Uploaded`}
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
