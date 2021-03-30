import React from 'react';
import { Divider, Title } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FlatList } from 'react-native';

import LoadingOverlay from 'src/components/LoadingOverlay';
import NavRow from 'src/components/NavRow';
import Notes from 'src/components/Notes';
import { LoginStore } from 'src/pullstate/loginStore';
import { DownloadStore } from 'src/pullstate/downloadStore';
import { INSPECTIONS_CHILDREN, INSPECTIONS_FORM_LIST } from 'src/navigation/screenNames';
import {
  InspectionChildrenParams,
  InspectionFormListParams,
  InspectionHomeRoute,
} from 'src/navigation/InspectionsNavigator';
import * as dbHooks from 'src/services/mongoHooks';
import { useResult } from 'src/utils/useResult';
import { styled, withTheme } from 'src/paperTheme';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { selectMongoComplete } from 'src/pullstate/selectors';

import DownloadingScreen from './DownloadingScreen';
import ErrorScreen from './ErrorScreen';
import BlankScreen from './BlankScreen';

const Container = withTheme(
  styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
    justify-content: center;
  `,
);

const TitleContainer = withTheme(
  styled.View`
    background-color: ${({ theme }) => theme.colors.surface};
    padding-horizontal: 30px;
    padding-top: 30px;
  `,
);

const InspectionsScreen: React.FC<{}> = () => {
  const {
    params: { parentId, showLocationPath },
  } = useRoute<InspectionHomeRoute>();
  const { progress, error } = DownloadStore.useState((s) => ({ progress: s.progress, error: s.error }));
  const userData = LoginStore.useState((s) => s.userData);
  const { initialized, isMongoComplete } = PersistentUserStore.useState((s) => ({
    initialized: s.initialized,
    isMongoComplete: selectMongoComplete(s),
  }));
  const shouldQueryInspections = initialized && isMongoComplete;
  const [{ parent, children: childrenStructures }, isLoadingInspections] = dbHooks.structures.useInspection(
    parentId,
    userData,
    shouldQueryInspections,
  );
  const [isReady, onReady] = useResult();
  const navigation = useNavigation();

  if (!userData) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <ErrorScreen userData={userData} />;
  }

  if (!initialized || (isLoadingInspections && shouldQueryInspections && progress === 100)) {
    return <LoadingOverlay />;
  }

  if (progress !== 100) {
    return <DownloadingScreen progress={progress} />;
  }

  return (
    <Container>
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
                  <TitleContainer>
                    {!!parent?.location_path && <Title style={{ fontWeight: 'bold' }}>{parent.location_path}</Title>}
                  </TitleContainer>
                )}

                <Notes value={parent?.notes} onReady={onReady} style={{ padding: 30 }} />
              </>
            }
            renderItem={({ item }) => (
              <NavRow
                label={showLocationPath ? item.location_path || item.display_name : item.display_name}
                onPress={() => {
                  if (item.active_children_count > 0) {
                    const p: InspectionChildrenParams = {
                      parentId: item.id,
                      title: item.display_name,
                      showLocationPath: false,
                      hasSearch: false,
                    };

                    navigation.navigate({
                      name: INSPECTIONS_CHILDREN,
                      key: `${parentId || 'base'}`,
                      params: p,
                    });
                  } else {
                    const p: InspectionFormListParams = {
                      parentId: item.id,
                      title: item.display_name,
                      hasSearch: false,
                    };

                    navigation.navigate(INSPECTIONS_FORM_LIST, p);
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
