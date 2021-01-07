import Datastore from 'react-native-local-mongodb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uniqBy } from 'lodash/fp';

import config from 'src/config';
import { Assignment, Structure } from 'src/types';
import { PersistentState } from 'src/pullstate/persistentStore/initialState';

function createStructureDb() {
  const db = new Datastore({ filename: `${config.APP_NAME}_structures`, storage: AsyncStorage });
  // @ts-ignore
  db.loadDatabase(function (err: Error | null) {
    if (err) {
      console.warn('structures db load error', JSON.stringify(err));
    }
  });

  return {
    clean() {
      return new Promise<void>((resolve, reject) => {
        db.remove({}, { multi: true }, function (err) {
          if (err) {
            console.warn('structures db clean error', JSON.stringify(err));
            reject();
          } else {
            resolve();
          }
        });
      });
    },

    insertPage(page: Structure[]) {
      return new Promise<void>((resolve, reject) => {
        db.insert(page, function (err) {
          if (err) {
            console.warn('structures db insertPage error', JSON.stringify(err));
            reject();
          } else {
            resolve();
          }
        });
      });
    },

    get(id: number) {
      return db.findOne({ id }).exec() as Promise<Structure>;
    },

    getBase() {
      return db.find({ ancestry: null }).exec() as Promise<Structure[]>;
    },

    getChildren(id: number) {
      return db.find({ parent_id: id }).exec() as Promise<Structure[]>;
    },
  };
}

function createAssignmentDb() {
  const db = new Datastore({ filename: `${config.APP_NAME}_assignments`, storage: AsyncStorage });
  // @ts-ignore
  db.loadDatabase(function (err: Error | null) {
    if (err) {
      console.warn('assignments db load error', JSON.stringify(err));
    }
  });

  return {
    clean() {
      return new Promise<void>((resolve, reject) => {
        db.remove({}, { multi: true }, function (err) {
          if (err) {
            console.warn('assignments db clean error', JSON.stringify(err));
            reject();
          } else {
            resolve();
          }
        });
      });
    },

    insertPage(page: Assignment[]) {
      return new Promise<void>((resolve, reject) => {
        db.insert(page, function (err) {
          if (err) {
            console.warn('assignments db insertPage error', JSON.stringify(err));
            reject();
          } else {
            resolve();
          }
        });
      });
    },

    get(id: number) {
      return db.findOne({ id }).exec() as Promise<Assignment>;
    },

    getAssignments(id: number) {
      return db.find({ structure_id: id }).exec() as Promise<Assignment[]>;
    },

    async getDistinctFormIds() {
      const results = (await db
        .find({ inspection_form_id: { $exists: true } }, { inspection_form_id: 1, _id: 0 })
        .exec()) as { inspection_form_id: number }[];

      return uniqBy('inspection_form_id', results).map((s) => s.inspection_form_id);
    },
  };
}

export const structuresDb = createStructureDb();
export const assignmentsDb = createAssignmentDb();

export async function cleanMongo() {
  await structuresDb.clean();
  await assignmentsDb.clean();
}

export function selectMongoComplete(s: PersistentState) {
  return (
    !!s.structuresDbMeta &&
    s.structuresDbMeta.currentPage === s.structuresDbMeta.totalPages &&
    !!s.assignmentsDbMeta &&
    s.assignmentsDbMeta.currentPage === s.assignmentsDbMeta.totalPages
  );
}
