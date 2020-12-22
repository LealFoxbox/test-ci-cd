import Datastore from 'react-native-local-mongodb';
import AsyncStorage from '@react-native-community/async-storage';
import { uniqBy } from 'lodash/fp';

import { Assignment, Structure } from 'src/types';

const db = new Datastore({ filename: 'asyncStorageKey', storage: AsyncStorage });
// @ts-ignore
db.loadDatabase(function (err: Error | null) {
  if (err) {
    console.warn('database load error', JSON.stringify(err));
  }
});

function createStructureDb() {
  let data = [] as Structure[];
  return {
    clean() {
      data = [];
    },

    insertPage(page: Structure[]) {
      data = data.concat(page);
    },

    get(id: number) {
      return data.find((s) => s.id === id);
    },

    getBase() {
      return data.filter((s) => !s.ancestry);
    },

    getChildren(id: number) {
      return data.filter((s) => s.parent_id === id);
    },
    isComplete() {
      return data.length > 0;
    },
  };
}

function createAssignmentDb() {
  let data = [] as Assignment[];
  return {
    clean() {
      data = [];
    },

    insertPage(page: Assignment[]) {
      data = data.concat(page);
    },

    get(id: number) {
      return data.find((s) => s.id === id);
    },

    isComplete() {
      return data.length > 0;
    },

    getAssignments(id: number) {
      return data.filter((s) => s.structure_id === id);
    },

    getDistinctFormIds() {
      return uniqBy('inspection_form_id', data).map((s) => s.inspection_form_id);
    },
  };
}

export const structuresDb = createStructureDb();
export const assignmentsDb = createAssignmentDb();

export function isMongoComplete() {
  return structuresDb.isComplete() && assignmentsDb.isComplete();
}

/*
const doc = {
  hello: 'world',
  n: 5,
  today: new Date(),
  'react-native-local-mongodbIsAwesome': true,
  notthere: null,
  notToBeSaved: undefined, // Will not be saved,
  fruits: ['apple', 'orange', 'pear'],
  infos: { name: 'react-native-local-mongodb' },
};

db.insert(doc, function (err, newDoc) {
  // Callback is optional
  // newDoc is the newly inserted document, including its _id
  // newDoc has no key called notToBeSaved since its value was undefined

  console.warn('database insert ... error? ', JSON.stringify(err), 'and newDoc: ', JSON.stringify(newDoc));
});

db.find({ hello: 'world' }, function (err: Error | null, docs: Array<typeof doc>) {
  console.warn('database find ... error? ', JSON.stringify(err), 'and docs: ', JSON.stringify(docs));
});

const endpoints = {
  structures: fetchStructures,
  ratings: fetchRatings,
  assignments: fetchAssignments,
};
 */
