import React from 'react';
import { FlatList, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Divider, Title, useTheme } from 'react-native-paper';

import { INSPECTIONS_FORM, INSPECTIONS_FORM_LIST } from 'src/navigation/screenNames';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { LoginStore } from 'src/pullstate/loginStore';
import { selectMongoComplete } from 'src/pullstate/selectors';
import { deleteDraftAction, initFormDraftAction } from 'src/pullstate/actions';
import * as dbHooks from 'src/services/mongoHooks';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import { useResult } from 'src/utils/useResult';
import NavRow from 'src/components/NavRow';
import SwipableRow from 'src/components/SwipableRow/SwipableRow';
import Notes from 'src/components/Notes';
import LoadingOverlay from 'src/components/LoadingOverlay';

import BlankScreen from './BlankScreen';

const FormListScreen: React.FC<{}> = () => {
  const {
    params: { parentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM_LIST>>();
  const { forms, drafts, ratings, isMongoComplete } = PersistentUserStore.useState((s) => ({
    forms: s.forms,
    ratings: s.ratings,
    drafts: s.drafts,
    isMongoComplete: selectMongoComplete(s),
  }));
  const isStaging = LoginStore.useState((s) => s.isStaging);
  const [structure] = dbHooks.structures.useGet(parentId, isMongoComplete);
  const [assignments, isLoadingAssignments] = dbHooks.assignments.useGetAssignments(parentId, forms);
  const theme = useTheme();
  const [isReady, onReady] = useResult<undefined>();
  const navigation = useNavigation();

  if (isLoadingAssignments) {
    return <LoadingOverlay />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      {assignments.length === 0 || !structure ? (
        <BlankScreen />
      ) : (
        <>
          <FlatList
            contentContainerStyle={{
              justifyContent: 'flex-start',
            }}
            ListHeaderComponent={
              <>
                {!!structure.location_path && (
                  <View style={{ backgroundColor: theme.colors.surface, paddingTop: 30, paddingHorizontal: 30 }}>
                    <Title style={{ fontWeight: 'bold' }}>{structure.location_path}</Title>
                  </View>
                )}
                <Notes value={structure.notes} onReady={onReady} style={{ padding: 30 }} />
              </>
            }
            data={assignments}
            ItemSeparatorComponent={Divider}
            renderItem={({ item }) => {
              const form = forms[item.inspection_form_id];
              const label = form?.name || '';
              const hasDraft = !!drafts[item.id] && drafts[item.id].isDirty;

              const row = (
                <NavRow
                  label={label}
                  icon={hasDraft ? 'file-document' : 'file-document-outline'}
                  onPress={() => {
                    if (!drafts[item.id]) {
                      const coords = { latitude: null, longitude: null };

                      initFormDraftAction({ form, isStaging, assignmentId: item.id, ratings, coords, structure });
                    }

                    navigation.navigate(INSPECTIONS_FORM, {
                      formId: item.inspection_form_id,
                      structureId: item.structure_id,
                      assignmentId: item.id,
                      title: label,
                    });
                  }}
                />
              );

              if (hasDraft) {
                return (
                  <SwipableRow leftLabel="Delete draft" onPressLeft={() => deleteDraftAction(item.id)}>
                    {row}
                  </SwipableRow>
                );
              }
              return row;
            }}
            keyExtractor={(item) => `${item.id}`}
          />
          {!isReady && <LoadingOverlay />}
        </>
      )}
    </View>
  );
};

export default FormListScreen;
