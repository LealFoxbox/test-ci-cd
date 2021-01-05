/* eslint-disable react-native-a11y/has-accessibility-props */
/* eslint-disable react-native/no-color-literals */
import React from 'react';
import { FlatList, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text, Title } from 'react-native-paper';

import { INSPECTIONS_FORM, INSPECTIONS_FORM_LIST } from 'src/navigation/screenNames';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { assignmentsDb, structuresDb } from 'src/services/mongodb';
import { Form } from 'src/types';
import { InspectionsNavigatorParamList } from 'src/navigation/InspectionsNavigator';

const FormItem: React.FC<{ item: Form; onPress: () => void }> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#c88',
        padding: 20,
        marginHorizontal: 10,
        marginBottom: 3.5,
        flexDirection: 'row',
      }}
      onPress={onPress}
    >
      <Text>
        {item.id} - {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const ItemsTable: React.FC<{}> = () => {
  const {
    params: { parentId },
  } = useRoute<RouteProp<InspectionsNavigatorParamList, typeof INSPECTIONS_FORM_LIST>>();
  const structure = !parentId ? null : structuresDb.get(parentId);
  const assignments = !parentId ? [] : assignmentsDb.getAssignments(parentId);
  const form = PersistentUserStore.useState((s) => s.forms);
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { navigate } = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
      }}
    >
      {!!structure && (
        <View>
          <Title>{structure.location_path || structure.display_name}</Title>
        </View>
      )}
      <FlatList
        contentContainerStyle={{
          paddingVertical: 30,
          justifyContent: 'flex-start',
        }}
        data={assignments}
        renderItem={({ item }) => (
          <FormItem
            item={form[item.inspection_form_id]}
            onPress={() =>
              navigate(INSPECTIONS_FORM, { formId: item.inspection_form_id, structureId: item.structure_id })
            }
          />
        )}
        keyExtractor={(item) => `${item.id}`}
      />
    </View>
  );
};

export default ItemsTable;
