import React from 'react';
import { FlatList, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Divider, Title, useTheme } from 'react-native-paper';

import { INSPECTIONS_FORM, INSPECTIONS_FORM_LIST } from 'src/navigation/screenNames';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import * as dbHooks from 'src/services/mongoHooks';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import NavRow from 'src/components/NavRow';
import Notes from 'src/components/Notes';
import LoadingOverlay from 'src/components/LoadingOverlay';

import BlankScreen from './BlankScreen';

const ItemsTable: React.FC<{}> = () => {
  const {
    params: { parentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM_LIST>>();
  const forms = PersistentUserStore.useState((s) => s.forms);
  const [structure] = dbHooks.structures.useGet(parentId);
  const [assignments, isLoading] = dbHooks.assignments.useGetAssignments(parentId, forms);
  const theme = useTheme();

  const navigation = useNavigation();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      {assignments.length === 0 && <BlankScreen />}
      {assignments.length > 0 && (
        <>
          {!!structure && (
            <View style={{ backgroundColor: theme.colors.surface, padding: 30 }}>
              {!!structure?.location_path && <Title style={{ fontWeight: 'bold' }}>{structure.location_path}</Title>}
            </View>
          )}
          <FlatList
            contentContainerStyle={{
              justifyContent: 'flex-start',
            }}
            ListHeaderComponent={() => <Notes value={structure?.notes} />}
            data={assignments}
            ItemSeparatorComponent={Divider}
            renderItem={({ item }) => {
              const label = forms[item.inspection_form_id]?.name || '';

              return (
                <NavRow
                  label={label}
                  icon="file-document-outline"
                  onPress={() => {
                    navigation.navigate(INSPECTIONS_FORM, {
                      formId: item.inspection_form_id,
                      structureId: item.structure_id,
                      title: label,
                    });
                  }}
                />
              );
            }}
            keyExtractor={(item) => `${item.id}`}
          />
        </>
      )}
    </View>
  );
};

export default ItemsTable;
