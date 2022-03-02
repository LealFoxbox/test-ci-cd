import React, { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Divider, Text, Title, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { LoginStore } from 'src/pullstate/loginStore';
import { selectMongoComplete } from 'src/pullstate/selectors';
import { deleteDraftAction, initFormDraftAction } from 'src/pullstate/formActions';
import * as dbHooks from 'src/services/mongoHooks';
import { InspectionFormListRoute, InspectionFormParams } from 'src/navigation/InspectionsNavigator';
import { useResult } from 'src/utils/useResult';
import NavRow from 'src/components/NavRow';
import SwipableRow from 'src/components/SwipableRow/SwipableRow';
import Notes from 'src/components/Notes';
import LoadingOverlay from 'src/components/LoadingOverlay';
import { rateAction } from 'src/pullstate/actions';
import config from 'src/config';
import RequestRateDialog from 'src/screens/Inspections/FormListScreen/RequestRateDialog';

import BlankScreen from '../BlankScreen';

const FormListScreen: React.FC<{}> = () => {
  const {
    params: { parentId },
  } = useRoute<InspectionFormListRoute>();
  const { forms, drafts, ratings, isMongoComplete } = PersistentUserStore.useState((s) => ({
    forms: s.forms,
    ratings: s.ratings,
    drafts: s.drafts,
    isMongoComplete: selectMongoComplete(s),
  }));
  const isStaging = LoginStore.useState((s) => s.isStaging);
  const [structure, isLoadingStructure] = dbHooks.structures.useGet(parentId, isMongoComplete);
  const [assignments, isLoadingAssignments] = dbHooks.assignments.useGetAssignments(parentId, forms);
  const theme = useTheme();
  const [isReady, onReady] = useResult<undefined>();
  const navigation = useNavigation();
  const [isVisibleRateDialog, setIsVisibleRateDialog] = useState(false);
  const { rateStatus } = LoginStore.useState((s) => ({
    rateStatus: s.rates?.[config.APP_BUILD]?.status,
  }));

  const handleHideDialog = useCallback(() => {
    setIsVisibleRateDialog(false);
  }, []);

  const onSubmitInspection = useCallback(() => {
    if (!rateStatus || rateStatus === 'update') {
      rateAction({
        appBuild: config.APP_BUILD,
        isRateCompleted: false,
      });
    }
    if (rateStatus === 'request') {
      setIsVisibleRateDialog(true);
    }
  }, [rateStatus]);

  if (isLoadingAssignments || isLoadingStructure) {
    return <LoadingOverlay />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      {assignments?.length === 0 || !structure ? (
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
                  icon="file-document-outline"
                  content={hasDraft ? <Text style={{ color: theme.colors.deficient }}>Draft</Text> : null}
                  onPress={() => {
                    if (!drafts[item.id]) {
                      const coords = { latitude: null, longitude: null };

                      initFormDraftAction({
                        form,
                        isStaging,
                        assignmentId: item.id,
                        ratings,
                        coords,
                        structureId: structure.id,
                        structure,
                      });
                    }

                    const p: InspectionFormParams = {
                      assignmentId: item.id,
                      title: label,
                      onSubmit: onSubmitInspection,
                    };

                    navigation.navigate(INSPECTIONS_FORM, p);
                  }}
                />
              );

              if (hasDraft) {
                return (
                  <SwipableRow
                    rightLabel={<MaterialCommunityIcons color={theme.colors.surface} name="delete-outline" size={32} />}
                    onPressRight={() => deleteDraftAction(item.id)}
                  >
                    {row}
                  </SwipableRow>
                );
              }
              return row;
            }}
            keyExtractor={(item) => `${item.id}`}
          />
          {!isReady && <LoadingOverlay />}
          <RequestRateDialog hideDialog={handleHideDialog} visible={isVisibleRateDialog} />
        </>
      )}
    </View>
  );
};

export default FormListScreen;
