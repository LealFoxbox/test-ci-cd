import React from 'react';
import { FlatList, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Divider, Text, Title, useTheme } from 'react-native-paper';

import { INSPECTIONS_FORM, INSPECTIONS_FORM_LIST } from 'src/navigation/screenNames';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import * as dbHooks from 'src/services/mongoHooks';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';
import NavRow from 'src/components/NavRow';
import Notes from 'src/components/Notes';

const ItemsTable: React.FC<{}> = () => {
  const {
    params: { parentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM_LIST>>();
  const forms = PersistentUserStore.useState((s) => s.forms);
  const [structure] = dbHooks.structures.useGet(parentId);
  const [assignments] = dbHooks.assignments.useGetAssignments(parentId, forms);
  const theme = useTheme();

  const navigation = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
      }}
    >
      {!!structure && (
        <View style={{ backgroundColor: theme.colors.surface, padding: 30 }}>
          <Title>{structure.display_name}</Title>
          {!!structure?.location_path && <Text style={{ fontWeight: 'bold' }}>{structure.location_path}</Text>}
        </View>
      )}
      <FlatList
        contentContainerStyle={{
          justifyContent: 'flex-start',
        }}
        ListHeaderComponent={() => <Notes value={structure?.notes} />}
        data={assignments}
        ItemSeparatorComponent={Divider}
        renderItem={({ item }) => (
          <NavRow
            label={forms[item.inspection_form_id]?.name || ''}
            icon="file-document-outline"
            onPress={() => {
              navigation.navigate(INSPECTIONS_FORM, {
                formId: item.inspection_form_id,
                structureId: item.structure_id,
              });
            }}
          />
        )}
        keyExtractor={(item) => `${item.id}`}
      />
    </View>
  );
};

export default ItemsTable;
