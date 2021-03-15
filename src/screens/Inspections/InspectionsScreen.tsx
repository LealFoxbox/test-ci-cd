import React from 'react';
import { Divider, Title, useTheme } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlatList, View } from 'react-native';

import LoadingOverlay from 'src/components/LoadingOverlay';
import NavRow from 'src/components/NavRow';
import Notes from 'src/components/Notes';
import { LoginStore } from 'src/pullstate/loginStore';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { INSPECTIONS_FORM_LIST, INSPECTIONS_HOME } from 'src/navigation/screenNames';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import * as dbHooks from 'src/services/mongoHooks';
import { useResult } from 'src/utils/useResult';
import { styled } from 'src/paperTheme';

import DownloadingScreen from './DownloadingScreen';
import ErrorScreen from './ErrorScreen';
import BlankScreen from './BlankScreen';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
`;

const InspectionsScreen: React.FC<{}> = () => {
  const {
    params: { parentId, showLocationPath },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_HOME>>();
  const { progress, error } = DownloadStore.useState((s) => ({ progress: s.progress, error: s.error }));
  const userData = LoginStore.useState((s) => s.userData);
  const [{ parent, children: childrenStructures }, isLoading, isComplete] = dbHooks.structures.useInspection(
    parentId,
    userData,
  );
  const [isReady, onReady] = useResult<undefined>();
  const theme = useTheme();
  const navigation = useNavigation();

  if (!userData) {
    return <Container theme={theme} />;
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
    <Container theme={theme}>
      {childrenStructures.length === 0 ? (
        <BlankScreen />
      ) : (
        <>
          <FlatList
            contentContainerStyle={{
              justifyContent: 'flex-start',
            }}
            data={childrenStructures}
            ItemSeparatorComponent={Divider}
            ListHeaderComponent={
              <>
                {!!parentId && !!parent && (
                  <View style={{ backgroundColor: theme.colors.surface, paddingHorizontal: 30, paddingTop: 30 }}>
                    {!!parent?.location_path && <Title style={{ fontWeight: 'bold' }}>{parent.location_path}</Title>}
                  </View>
                )}

                <Notes value={parent?.notes} onReady={onReady} style={{ padding: 30 }} />
              </>
            }
            renderItem={({ item }) => (
              <NavRow
                label={showLocationPath ? item.location_path || item.display_name : item.display_name}
                onPress={() => {
                  if (item.active_children_count > 0) {
                    navigation.navigate({
                      name: INSPECTIONS_HOME,
                      key: `${parentId || 'base'}`,
                      params: { parentId: item.id, title: item.display_name, showLocationPath: false },
                    });
                  } else {
                    navigation.navigate(INSPECTIONS_FORM_LIST, { parentId: item.id, title: item.display_name });
                  }
                }}
              />
            )}
            keyExtractor={(item) => `${item.id}`}
          />
          {!isReady && <LoadingOverlay />}
        </>
      )}
    </Container>
  );
};

export default InspectionsScreen;
