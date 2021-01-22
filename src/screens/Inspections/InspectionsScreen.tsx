import React from 'react';
import { Divider, Title, useTheme } from 'react-native-paper';
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
import { useResult } from 'src/utils/useResult';

import { Container } from './styles';
import DownloadingScreen from './DownloadingScreen';
import ErrorScreen from './ErrorScreen';
import BlankScreen from './BlankScreen';

const InspectionsScreen: React.FC<{}> = () => {
  const userData = PersistentUserStore.useState((s) => s.userData);
  const {
    params: { parentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_HOME>>();
  const { progress, error } = DownloadStore.useState((s) => s);
  const [{ parent, children }, isLoading, isComplete] = dbHooks.structures.useInspection(parentId);
  const theme = useTheme();
  const [isReady, onReady] = useResult<undefined>();

  const navigation = useNavigation();

  if (!userData) {
    return <Container />;
  }

  if (error) {
    return <ErrorScreen />;
  }

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (progress !== 100 || !isComplete) {
    return <DownloadingScreen progress={progress} />;
  }

  return (
    <Container>
      {children.length === 0 && <BlankScreen />}
      {children.length > 0 && (
        <>
          {!!parentId && !!parent && (
            <View style={{ backgroundColor: theme.colors.surface, padding: 30 }}>
              {!!parent?.location_path && <Title style={{ fontWeight: 'bold' }}>{parent.location_path}</Title>}
            </View>
          )}
          <FlatList
            contentContainerStyle={{
              justifyContent: 'flex-start',
            }}
            data={children}
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={() => <Notes value={parent?.notes} onReady={onReady} />}
            renderItem={({ item }) => (
              <NavRow
                label={item.display_name}
                onPress={() => {
                  if (item.active_children_count > 0) {
                    navigation.navigate({
                      name: INSPECTIONS_HOME,
                      key: `${parentId || 'base'}`,
                      params: { parentId: item.id, title: item.display_name },
                    });
                  } else {
                    navigation.navigate(INSPECTIONS_FORM_LIST, { parentId: item.id, title: item.display_name });
                  }
                }}
              />
            )}
            keyExtractor={(item) => `${item.id}`}
          />
        </>
      )}
      {!isReady && <LoadingOverlay />}
    </Container>
  );
};

export default InspectionsScreen;
