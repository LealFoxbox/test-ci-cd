/* eslint-disable no-console */
import Datastore from 'react-native-local-mongodb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { filter, find, uniqBy } from 'lodash/fp';

import config, { getMockFlags } from 'src/config';
import { Assignment, Structure } from 'src/types';

type StructuresDb = ReturnType<typeof createStructureDb>;
type AssignmentDb = ReturnType<typeof createAssignmentDb>;

export function createStructureMock() {
  let data: Structure[] = [];

  return {
    loadPromise: Promise.resolve(),
    clean() {
      return new Promise<void>((resolve) => {
        data = [];
        resolve();
      });
    },

    insertPage(page: Structure[]) {
      return new Promise<void>((resolve) => {
        data = data.concat(page);
        resolve();
      });
    },

    get(id: number) {
      return new Promise<Structure | undefined>((resolve) => {
        resolve(find({ id }, data));
      });
    },

    getAll() {
      return new Promise<Structure[]>((resolve) => {
        resolve(data);
      });
    },

    getMultiple(ids: number[]) {
      return new Promise<Structure[]>((resolve) => {
        resolve(filter((s) => ids.includes(s.id), data));
      });
    },

    getChildren(id: number) {
      return new Promise<Structure[]>((resolve) => {
        resolve(filter((s) => s.parent_id === id, data));
      });
    },
  };
}

export function createAssignmentMock() {
  let data: Assignment[] = [];

  return {
    loadPromise: Promise.resolve(),
    clean() {
      return new Promise<void>((resolve) => {
        data = [];
        resolve();
      });
    },

    insertPage(page: Assignment[]) {
      return new Promise<void>((resolve) => {
        data = data.concat(page);
        resolve();
      });
    },

    get(id: number) {
      return new Promise<Assignment | undefined>((resolve) => {
        resolve(find({ id }, data));
      });
    },

    getAll() {
      return new Promise<Assignment[]>((resolve) => {
        resolve(data);
      });
    },

    getAssignments(id: number) {
      return new Promise<Assignment[]>((resolve) => {
        resolve(filter((s) => s.structure_id === id, data));
      });
    },

    async getDistinctFormIds() {
      return new Promise<number[]>((resolve) => {
        resolve(uniqBy('inspection_form_id', data).map((s) => s.inspection_form_id));
      });
    },
  };
}

export function createStructureDb() {
  const db = new Datastore({ filename: `${config.APP_NAME}_structures`, storage: AsyncStorage });

  return {
    loadPromise: new Promise<void>((resolve, reject) => {
      // @ts-ignore
      db.loadDatabase(function (err: Error | null) {
        if (err) {
          console.warn('structures db load error', JSON.stringify(err));
          reject();
        } else {
          resolve();
        }
      });
    }),
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
      }).then(() => {
        // @ts-ignore
        db.persistence.compactDatafile();
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

    get(id: number | null) {
      return db.findOne({ id }).exec() as Promise<Structure | undefined>;
    },

    getAll() {
      return db.find({}).exec() as Promise<Structure[]>;
    },

    getMultiple(ids: number[]) {
      return db
        .find({ id: { $in: ids } })
        .sort({ display_name: 1 })
        .exec() as Promise<Structure[]>;
    },

    getChildren(id: number | null) {
      return db.find({ parent_id: id }).sort({ display_name: 1 }).exec() as Promise<Structure[]>;
    },
  };
}

export function createAssignmentDb() {
  const db = new Datastore({ filename: `${config.APP_NAME}_assignments`, storage: AsyncStorage });

  return {
    loadPromise: new Promise<void>((resolve, reject) => {
      // @ts-ignore
      db.loadDatabase(function (err: Error | null) {
        if (err) {
          console.warn('assignments db load error', JSON.stringify(err));
          reject();
        } else {
          resolve();
        }
      });
    }),
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
      }).then(() => {
        // @ts-ignore
        db.persistence.compactDatafile();
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

    getAll() {
      return db.find({}).exec() as Promise<Assignment[]>;
    },

    get(id: number) {
      return db.findOne({ id }).exec() as Promise<Assignment | undefined>;
    },

    getAssignments(id: number) {
      return db.find({ structure_id: id }).sort({ display_name: 1 }).exec() as Promise<Assignment[]>;
    },

    async getDistinctFormIds() {
      const results = (await db
        .find({ inspection_form_id: { $exists: true } }, { inspection_form_id: 1, _id: 0 })
        .exec()) as { inspection_form_id: number }[];

      return uniqBy('inspection_form_id', results).map((s) => s.inspection_form_id);
    },
  };
}

export const structuresDb: StructuresDb = !getMockFlags(true).DB ? createStructureDb() : createStructureMock();
export const assignmentsDb: AssignmentDb = !getMockFlags(true).DB ? createAssignmentDb() : createAssignmentMock();

export async function cleanMongo() {
  await structuresDb.clean();
  await assignmentsDb.clean();
}
