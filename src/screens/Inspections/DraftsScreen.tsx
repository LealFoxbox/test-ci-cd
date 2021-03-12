import React from 'react';
import { Divider, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native';
import { sortBy } from 'lodash/fp';

import { INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { styled } from 'src/paperTheme';
import SwipableRow from 'src/components/SwipableRow';
import { deleteDraftAction } from 'src/pullstate/formActions';

import DraftRow from './DraftRow';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  justify-content: center;
`;

const DraftsScreen: React.FC<{}> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const drafts = PersistentUserStore.useState((s) => sortBy('started_at', Object.values(s.drafts)));

  return (
    <Container theme={theme}>
      <FlatList
        contentContainerStyle={{
          justifyContent: 'flex-start',
        }}
        data={drafts}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => (
          <SwipableRow leftLabel="Delete draft" onPressLeft={() => deleteDraftAction(item.assignmentId)}>
            <DraftRow
              label={item.name}
              content={item.locationPath}
              onPress={() => {
                navigation.navigate(INSPECTIONS_FORM, {
                  formId: item.formId,
                  structureId: item.structureId,
                  assignmentId: item.assignmentId,
                  title: item.name,
                });
              }}
              hasPhotos={Object.values(item.fields).some((f) => f.photos.length > 0)}
              lastModified={item.lastModified || item.started_at || Date.now()}
            />
          </SwipableRow>
        )}
        keyExtractor={(item) => `${item.guid}`}
      />
    </Container>
  );
};

export default DraftsScreen;
