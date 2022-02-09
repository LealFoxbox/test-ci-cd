/* eslint-disable no-console */
import Datastore from 'react-native-local-mongodb';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { escapeRegExp, filter, find, uniqBy, words } from 'lodash/fp';
import * as Sentry from '@sentry/react-native';

import config, { getMockFlags } from 'src/config';
import { Assignment, Structure } from 'src/types';
import { logErrorToSentry } from 'src/utils/logger';

type StructuresDb = ReturnType<typeof createStructureDb>;
type AssignmentDb = ReturnType<typeof createAssignmentDb>;

export function createSearchRegex(s: string) {
  // TODO: use this regex instead
  // https://regexr.com/335fm
  return new RegExp(
    words(escapeRegExp(s))
      .map((w) => `(?=.*${w})`)
      .join(''),
    'i',
  );
}

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

    search(input: string, field = 'display_name' as keyof Structure, limit = 20) {
      const r = createSearchRegex(input);
      return new Promise<Structure[]>((resolve) => {
        resolve(data.filter((s) => r.test(s[field] as string)).slice(0, limit));
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

    getAssignments(id: number | null) {
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

let shouldInsert = false;
let structureKey = 1;
let previous = '';
let currentKey = `${config.APP_NAME}_structures`;

const asyncMethods = {
  getItem: async (key: string, callback?: (error?: Error, result?: string) => void): Promise<string | null> => {
    return AsyncStorage.getItem(key, callback);
  },

  /**
   * Sets value for key and calls callback on completion, along with an Error if there is any
   */
  setItem: async (key: string, value: string, callback?: (error?: Error) => void): Promise<void> => {
    if (!value) {
      return AsyncStorage.setItem(key, value, callback);
    }

    if (!shouldInsert) {
      return AsyncStorage.setItem(key, value, callback);
    }

    const property = value.slice(0, value.indexOf('\n'));

    //Checking if it's of type Assignments. If yes, it must return.
    if (Object.prototype.hasOwnProperty.call(JSON.parse(property), 'structure_id')) {
      return AsyncStorage.setItem(key, value, callback);
    }

    await AsyncStorage.getItem(currentKey, (error, item) => {
      if (!error && item && item.length >= 1400000) {
        currentKey = `${config.APP_NAME}_structures_${structureKey}`;
        structureKey++;

        void AsyncStorage.setItem(currentKey, value.replace(previous, ''), callback);
      } else {
        void AsyncStorage.setItem(currentKey, `${item || ''}${value.replace(previous, '')}`, callback);

        if (structureKey === 1) {
          previous = value;
        }
      }
    });

    return Promise.resolve();
  },

  removeItem: async (key: string, callback?: (error?: Error) => void): Promise<void> => {
    return AsyncStorage.removeItem(key, callback);
  },
};

const getData = async (id: number | null, keys: string[], search = false, input: string): Promise<Structure[]> => {
  try {
    if (!id && !search) return [];

    let list = '';

    if (keys && keys.length) {
      const filteredKeys = keys.filter((item) => !item.includes('_assignments'));

      const stores = await AsyncStorage.multiGet(filteredKeys);

      if (stores && stores.length) {
        stores.forEach((item) => {
          if (item.length && item.length > 1) {
            list += item[1];
          }
        });
      }
    }

    const jsonList = JSON.parse('[' + list.replace(/\n/g, ',') + '{}]') as Structure[];

    let filteredList: Structure[];

    if (search) {
      let count = 0;

      filteredList = jsonList.filter(function (item) {
        if (
          count < 20 &&
          item.location_path &&
          item.location_path.toLocaleLowerCase().includes(input.toLocaleLowerCase())
        ) {
          count++;
          return true;
        }
        return false;
      });
    } else {
      filteredList = jsonList.filter((item) => item.parent_id === id);
    }

    filteredList.sort((a, b) => {
      if (a.display_name > b.display_name) {
        return 1;
      }
      if (a.display_name < b.display_name) {
        return -1;
      }
      return 0;
    });

    return filteredList;
  } catch (error) {
    logErrorToSentry('[ERROR][RequestStorageDataBase]', {
      severity: Sentry.Severity.Error,
      infoMessage: error?.message,
    });

    return [];
  }
};

export function createStructureDb() {
  const db = new Datastore({
    filename: currentKey,
    storage: asyncMethods,
  });

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
      shouldInsert = true;

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

    async search(input: string, field = 'display_name', limit = 20) {
      const keys = await AsyncStorage.getAllKeys();

      if (keys && keys.length > 2) {
        return getData(null, keys, true, input);
      } else {
        return db
          .find({ [field]: createSearchRegex(input) })
          .limit(limit)
          .exec() as Promise<Structure[]>;
      }
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

    async getChildren(id: number | null) {
      const keys = await AsyncStorage.getAllKeys();

      if (keys && keys.length > 2) {
        return getData(id, keys, false, '');
      } else {
        return db.find({ parent_id: id }).sort({ display_name: 1 }).exec() as Promise<Structure[]>;
      }
    },
  };
}

export function createAssignmentDb() {
  const db = new Datastore({ filename: `${config.APP_NAME}_assignments`, storage: asyncMethods });

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

    getAssignments(id: number | null) {
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

export const assignmentsDb: AssignmentDb = !getMockFlags(true).DB ? createAssignmentDb() : createAssignmentMock();
export const structuresDb: StructuresDb = !getMockFlags(true).DB ? createStructureDb() : createStructureMock();

export async function cleanMongo() {
  await structuresDb.clean();
  await assignmentsDb.clean();
  await AsyncStorage.clear();
}

export async function cleanAsyncStorage() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.warn('Asyncstorage.clear', error.message);
  }
}
