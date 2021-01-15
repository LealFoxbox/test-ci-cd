import React from 'react';
import { Divider, Text, Title, useTheme } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlatList, View } from 'react-native';

import LoadingOverlay from 'src/components/LoadingOverlay';
import NavRow from 'src/components/NavRow';
import Notes from 'src/components/Notes';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { INSPECTIONS_FORM_LIST, INSPECTIONS_HOME } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import * as dbHooks from 'src/services/mongoHooks';

import { Container } from './styles';
import DownloadingScreen from './DownloadingScreen';
import ErrorScreen from './ErrorScreen';

const InspectionsScreen: React.FC<{}> = () => {
  const userData = PersistentUserStore.useState((s) => s.userData);
  const {
    params: { parentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_HOME>>();
  const { progress, error } = DownloadStore.useState((s) => s);
  const [{ parent, children }, isLoading] = dbHooks.structures.useInspection(parentId);
  const theme = useTheme();

  const navigation = useNavigation();

  if (!userData) {
    return <Container />;
  }

  if (error) {
    return <ErrorScreen />;
  }

  if (progress !== 100 || isLoading) {
    return progress === 100 || progress === 0 ? <LoadingOverlay /> : <DownloadingScreen progress={progress} />;
  }

  return (
    <Container>
      <View style={{ backgroundColor: theme.colors.surface, padding: 30 }}>
        <Title>{!parentId || !parent ? 'Your Areas' : parent.display_name}</Title>
        {!!parent?.location_path && <Text style={{ fontWeight: 'bold' }}>{parent.location_path}</Text>}
      </View>
      <FlatList
        contentContainerStyle={{
          justifyContent: 'flex-start',
        }}
        data={children}
        ItemSeparatorComponent={Divider}
        ListHeaderComponent={() => <Notes value={parent?.notes} />}
        renderItem={({ item }) => (
          <NavRow
            label={item.display_name}
            onPress={() => {
              if (item.active_children_count > 0) {
                navigation.navigate({
                  name: INSPECTIONS_HOME,
                  key: `${parentId || 'base'}`,
                  params: { parentId: item.id },
                });
              } else {
                navigation.navigate(INSPECTIONS_FORM_LIST, { parentId: item.id });
              }
            }}
          />
        )}
        keyExtractor={(item) => `${item.id}`}
      />
    </Container>
  );
};

export default InspectionsScreen;
