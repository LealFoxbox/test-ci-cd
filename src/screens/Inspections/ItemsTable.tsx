/* eslint-disable react-native-a11y/has-accessibility-props */
/* eslint-disable react-native/no-color-literals */
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text } from 'react-native-paper';

import { INSPECTIONS_FORM } from 'src/navigation/screenNames';
import { PersistentUserStore } from 'src/pullstate/persistentStore';
import { assignmentsDb, structuresDb } from 'src/services/mongodb';
import { Form, Structure } from 'src/types';

const StructureItem: React.FC<{ item: Structure; onPress: () => void }> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#ccc',
        padding: 20,
        marginHorizontal: 10,
        marginBottom: 3.5,
        flexDirection: 'row',
      }}
      onPress={onPress}
    >
      <Text>{item.display_name}</Text>
    </TouchableOpacity>
  );
};

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
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
};

const ItemsTable: React.FC<{ parentId: number | null; onPress: (id: number) => void }> = ({ parentId, onPress }) => {
  const structures = !parentId ? structuresDb.getBase() : structuresDb.getChildren(parentId);
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
      <FlatList
        contentContainerStyle={{
          paddingVertical: 30,
          justifyContent: 'flex-start',
        }}
        data={structures}
        renderItem={({ item }) => <StructureItem item={item} onPress={() => onPress(item.id)} />}
        keyExtractor={(item) => `${item.id}`}
      />
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
