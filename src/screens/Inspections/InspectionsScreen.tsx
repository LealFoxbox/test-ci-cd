/* eslint-disable react-native-a11y/has-accessibility-props */
/* eslint-disable react-native/no-color-literals */

import React from 'react';
import { Text, Title } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlatList, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { INSPECTIONS_FORM_LIST, INSPECTIONS_HOME } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import * as dbHooks from 'src/services/mongoHooks';
import { Structure } from 'src/types';

import { Container, MessageContainer } from './styles';

const StructureItem: React.FC<{ item: Structure; onPress: () => void }> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#ccc',
        padding: 20,
        marginHorizontal: 10,
        marginBottom: 3.5,
        flexDirection: 'row',
      }}
      onPress={onPress}
    >
      <Text>{item.display_name}</Text>
    </TouchableOpacity>
  );
};

const InspectionsScreen: React.FC<{}> = () => {
  const userData = PersistentUserStore.useState((s) => s.userData);
  const {
    params: { parentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_HOME>>();
  const { progress, error } = DownloadStore.useState((s) => s);
  const [parentStructure, isLoadingParent] = dbHooks.structures.useGet(parentId);
  const [structures, isLoadingChildren] = dbHooks.structures.useGetChildren(parentId);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { navigate } = useNavigation();

  if (!userData) {
    return <Container />;
  }

  if (error) {
    return (
      <MessageContainer>
        <Title style={{ textAlign: 'center' }}>An error ocurred, please reload</Title>
      </MessageContainer>
    );
  }

  if (progress !== 100 || isLoadingParent || isLoadingChildren) {
    return (
      <MessageContainer>
        {progress === 100 ? (
          <Title style={{ textAlign: 'center' }}>Processing</Title>
        ) : (
          <Title style={{ textAlign: 'center' }}>Downloading, progress is {progress}</Title>
        )}
      </MessageContainer>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
      }}
    >
      <View>
        <Title>{!parentStructure ? 'Your Areas' : parentStructure.location_path || parentStructure.display_name}</Title>
        {!!parentStructure?.notes && <Text>{parentStructure?.notes}</Text>}
      </View>

      <FlatList
        contentContainerStyle={{
          paddingVertical: 30,
          justifyContent: 'flex-start',
        }}
        data={structures}
        renderItem={({ item }) => (
          <StructureItem
            item={item}
            onPress={() => {
              if (item.active_children_count > 0) {
                navigate({ name: INSPECTIONS_HOME, key: `${parentId || 'base'}`, params: { parentId: item.id } });
              } else {
                navigate(INSPECTIONS_FORM_LIST, { parentId: item.id });
              }
            }}
          />
        )}
        keyExtractor={(item) => `${item.id}`}
      />
    </View>
  );
};

export default InspectionsScreen;
