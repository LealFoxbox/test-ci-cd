import React from 'react';
import { FlatList, View } from 'react-native';
import { Divider } from 'react-native-paper';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import Row from 'src/components/Row';
import ConnectionBanner from 'src/components/ConnectionBanner';
import { useNetworkStatus } from 'src/utils/useNetworkStatus';

import BlankScreen from './BlankScreen';

const UploadsScreen: React.FC<{}> = () => {
  const uploads = PersistentUserStore.useState((s) => s.uploads);
  const pendingUploads = PersistentUserStore.useState((s) => s.pendingUploads);
  const connected = useNetworkStatus();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <ConnectionBanner connected={connected} />
      {uploads.length === 0 && pendingUploads.length === 0 && <BlankScreen />}
      {pendingUploads.length > 0 && (
        <FlatList
          contentContainerStyle={{
            justifyContent: 'flex-start',
          }}
          data={pendingUploads}
          ItemSeparatorComponent={Divider}
          renderItem={({ item }) => {
            return <Row label={item.draft.name} value={`Progress ${item.progress}%`} icon="brush" />;
          }}
          keyExtractor={(item) => `${item.draft.guid}`}
        />
      )}
      {uploads.length > 0 && (
        <FlatList
          contentContainerStyle={{
            justifyContent: 'flex-start',
          }}
          data={uploads}
          ItemSeparatorComponent={Divider}
          renderItem={({ item }) => {
            return <Row label={item.name} value={`Uploaded`} icon="brush" />;
          }}
          keyExtractor={(item) => `${item.guid}`}
        />
      )}
    </View>
  );
};

export default UploadsScreen;
